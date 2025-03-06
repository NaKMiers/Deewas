import { connectDatabase } from '@/config/database'
import { toUTC } from '@/lib/time'
import BudgetModel from '@/models/BudgetModel'
import TransactionModel from '@/models/TransactionModel'
import { getToken } from 'next-auth/jwt'
import { NextRequest, NextResponse } from 'next/server'

// Models: Budget, Transaction, Category
import '@/models/BudgetModel'
import '@/models/CategoryModel'
import '@/models/TransactionModel'

// [PUT]: /budget/:id/update
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  console.log('- Update Budget -')

  try {
    const token = await getToken({ req })
    const userId = token?._id

    // check if user is logged
    if (!userId) {
      return NextResponse.json({ message: 'Please login to continue' }, { status: 401 })
    }

    // get budget id from params
    const { id } = await params

    // get data from request body
    const { categoryId, total, begin, end } = await req.json()

    const response = await updateBudget(id, categoryId, begin, end, total)

    // return response
    return NextResponse.json(response, { status: 200 })
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 })
  }
}

export const updateBudget = async (
  budgetId: string,
  categoryId: string,
  begin: string,
  end: string,
  total: number
) => {
  try {
    // connect to database
    await connectDatabase()

    // calculate total amount of transactions of category from begin to end of budget
    const transactions = await TransactionModel.find({
      category: categoryId,
      date: { $gte: toUTC(begin), $lte: toUTC(end) },
    }).lean()
    const totalAmount = transactions.reduce((total, transaction) => total + transaction.amount, 0)

    // update budget
    const budget = await BudgetModel.findByIdAndUpdate(
      budgetId,
      {
        $set: {
          category: categoryId,
          total,
          begin: toUTC(begin),
          end: toUTC(end),
          amount: totalAmount,
        },
      },
      { new: true }
    )
      .populate('category')
      .lean()

    return { budget: JSON.parse(JSON.stringify(budget)), message: 'Updated budget' }
  } catch (err: any) {
    throw new Error(err)
  }
}
