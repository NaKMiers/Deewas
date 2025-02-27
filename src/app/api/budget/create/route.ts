import { connectDatabase } from '@/config/database'
import { toUTC } from '@/lib/time'
import BudgetModel from '@/models/BudgetModel'
import { getToken } from 'next-auth/jwt'
import { NextRequest, NextResponse } from 'next/server'

// Models: Budget
import '@/models/BudgetModel'

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
    const { categoryId, walletId, name, total, begin, end } = await req.json()

    // create budget
    const budget = await BudgetModel.create({
      user: userId,
      wallet: walletId,
      category: categoryId,
      name,
      total,
      begin: toUTC(begin),
      end: toUTC(end),
    })

    // return response
    return NextResponse.json({ budget, message: 'Created budget' }, { status: 200 })
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 })
  }
}
