import { connectDatabase } from '@/config/database'
import TransactionModel from '@/models/TransactionModel'
import { getToken } from 'next-auth/jwt'
import { NextRequest, NextResponse } from 'next/server'

// [POST]: /transaction/create
export async function POST(req: NextRequest) {
  console.log('- Create Transaction - ')

  try {
    // connect to database
    await connectDatabase()

    const token = await getToken({ req })
    const userId = token?._id

    // check if user is logged in
    if (!userId) {
      return NextResponse.json({ message: 'Please login to continue' }, { status: 401 })
    }

    // get data from request
    const { walletId, categoryId, name, amount, date, type } = await req.json()

    console.log('walletId', walletId)
    console.log('categoryId', categoryId)
    console.log('name', name)
    console.log('amount', amount)
    console.log('date', date)
    console.log('type', type)

    // create transaction
    const transaction = await TransactionModel.create({
      user: userId,
      wallet: walletId,
      category: categoryId,
      name,
      amount,
      date,
      type,
    })

    // return response
    return NextResponse.json({ transaction, message: 'Created transaction' }, { status: 200 })
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 })
  }
}
