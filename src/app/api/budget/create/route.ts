import { connectDatabase } from '@/config/database'
import { toUTC } from '@/lib/time'
import BudgetModel from '@/models/BudgetModel'
import CategoryModel from '@/models/CategoryModel'
import TransactionModel from '@/models/TransactionModel'
import { getToken } from 'next-auth/jwt'
import { NextRequest, NextResponse } from 'next/server'

// Models: Budget, Transaction, Category
import '@/models/BudgetModel'
import '@/models/CategoryModel'
import '@/models/TransactionModel'

// [POST]: /budget/create
export async function POST(req: NextRequest) {
  console.log('- Create Budget -')

  try {
    const token = await getToken({ req })
    const userId = token?._id as string

    // check if user is logged
    if (!userId) {
      return NextResponse.json({ message: 'Please login to continue' }, { status: 401 })
    }

    // get data from request body
    const { categoryId, total, begin, end } = await req.json()

    const response = await createBudget(userId, categoryId, begin, end, total)

    // return response
    return NextResponse.json(response, { status: 200 })
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 })
  }
}

export const createBudget = async (
  userId: string,
  categoryId: string,
  begin: string,
  end: string,
  total: number
) => {
  // connect to database
  await connectDatabase()

  // check if category is an expense
  const category: any = await CategoryModel.findById(categoryId).select('type').lean()

  if (!category || category.type !== 'expense') {
    throw new Error('Category is not an expense')
  }

  // calculate total amount of transactions of category from begin to end of budget
  const transactions = await TransactionModel.find({
    category: categoryId,
    date: { $gte: toUTC(begin), $lte: toUTC(end) },
  }).lean()
  const totalAmount = transactions.reduce((total, transaction) => total + transaction.amount, 0)

  // create budget
  const bud = await BudgetModel.create({
    user: userId,
    category: categoryId,
    total,
    begin: toUTC(begin),
    end: toUTC(end),
    amount: totalAmount,
  })

  // get newly created budget
  const budget = await BudgetModel.findById(bud._id).populate('category').lean()

  if (!budget) {
    throw new Error('Failed to create budget')
  }

  return { budget: JSON.parse(JSON.stringify(budget)), message: 'Created budget' }
}
