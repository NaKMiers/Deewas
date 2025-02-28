import { connectDatabase } from '@/config/database'
import { toUTC } from '@/lib/time'
import TransactionModel from '@/models/TransactionModel'
import { getToken } from 'next-auth/jwt'
import { NextRequest, NextResponse } from 'next/server'

// Models: Transaction, Category
import '@/models/CategoryModel'
import '@/models/TransactionModel'

// [GET]: /
export async function GET(req: NextRequest) {
  console.log('- Get Overview - ')

  try {
    // connect to database
    await connectDatabase()

    const token = await getToken({ req })
    const userId = token?._id

    // check if user is logged in
    if (!userId) {
      return NextResponse.json({ message: 'Please login to continue' }, { status: 401 })
    }

    const { searchParams } = new URL(req.nextUrl)
    const walletId = searchParams.get('walletId')
    const from = searchParams.get('from')
    const to = searchParams.get('to')

    // required wallet id
    if (!walletId) {
      return NextResponse.json({ message: 'Please select a wallet' }, { status: 400 })
    }

    // required date range
    if (!from || !to) {
      return NextResponse.json({ message: 'Please provide date range' }, { status: 400 })
    }

    // get all transaction in time range
    const transactions = await TransactionModel.find({
      user: userId,
      wallet: walletId,
      date: { $gte: toUTC(from), $lte: toUTC(to) },
      deleted: false,
    })
      .populate('category wallet')
      .sort({ date: -1 })
      .lean()

    // return response
    return NextResponse.json({ transactions, message: 'Home is here' }, { status: 200 })
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 })
  }
}
