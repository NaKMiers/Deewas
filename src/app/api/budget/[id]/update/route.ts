import { connectDatabase } from '@/config/database'
import { toUTC } from '@/lib/time'
import BudgetModel from '@/models/BudgetModel'
import TransactionModel from '@/models/TransactionModel'
import { getToken } from 'next-auth/jwt'
import { NextRequest, NextResponse } from 'next/server'

// Models: Budget, Transaction
import '@/models/BudgetModel'
import '@/models/TransactionModel'

// [PUT]: /budget/:id/update
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  console.log('- Update Budget -')

  try {
    // connect to database
    await connectDatabase()

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

    // calculate total amount of transactions of category from begin to end of budget
    const transactions = await TransactionModel.find({
      category: categoryId,
      date: { $gte: toUTC(begin), $lte: toUTC(end) },
    }).lean()
    const totalAmount = transactions.reduce((total, transaction) => total + transaction.amount, 0)

    // update budget
    const budget = await BudgetModel.findByIdAndUpdate(
      id,
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
    ).lean()

    // return response
    return NextResponse.json({ budget, message: 'Updated budget' }, { status: 200 })
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 })
  }
}
