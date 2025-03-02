import { connectDatabase } from '@/config/database'
import { toUTC } from '@/lib/time'
import BudgetModel from '@/models/BudgetModel'
import TransactionModel from '@/models/TransactionModel'
import { getToken } from 'next-auth/jwt'
import { NextRequest, NextResponse } from 'next/server'

// Models: Budget, Transaction
import '@/models/BudgetModel'
import '@/models/TransactionModel'

// [POST]: /budget/create
export async function POST(req: NextRequest) {
  console.log('- Create Budget -')

  try {
    // connect to database
    await connectDatabase()

    const token = await getToken({ req })
    const userId = token?._id

    // check if user is logged
    if (!userId) {
      return NextResponse.json({ message: 'Please login to continue' }, { status: 401 })
    }

    // get data from request body
    const { categoryId, total, begin, end } = await req.json()

    // calculate total amount of transactions of category from begin to end of budget
    const transactions = await TransactionModel.find({
      category: categoryId,
      date: { $gte: toUTC(begin), $lte: toUTC(end) },
    }).lean()
    const totalAmount = transactions.reduce((total, transaction) => total + transaction.amount, 0)

    // create budget
    const budget = await BudgetModel.create({
      user: userId,
      category: categoryId,
      total,
      begin: toUTC(begin),
      end: toUTC(end),
      amount: totalAmount,
    })

    // return response
    return NextResponse.json({ budget, message: 'Created budget' }, { status: 200 })
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 })
  }
}
