import { connectDatabase } from '@/config/database'
import { toUTC } from '@/lib/time'
import TransactionModel from '@/models/TransactionModel'
import { getToken } from 'next-auth/jwt'
import { NextRequest, NextResponse } from 'next/server'

// Models: Transaction, Wallet, Category
import '@/models/CategoryModel'
import '@/models/TransactionModel'
import '@/models/WalletModel'

export const dynamic = 'force-dynamic'

// [GET]: /transactions
export async function GET(req: NextRequest) {
  console.log('- Get Transactions -')

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

    console.log('Wallet ID:', walletId)

    if (!from || !to) {
      return NextResponse.json({ message: 'Invalid date range' }, { status: 400 })
    }

    // MARK: Overview
    const transactions = await TransactionModel.find({
      user: userId,
      wallet: walletId,
      deleted: false,
      date: {
        $gte: toUTC(from),
        $lte: toUTC(to),
      },
    })
      .populate('wallet category')
      .sort({ date: -1 })
      .lean()

    // return response
    return NextResponse.json({ transactions, message: 'Transactions are here' }, { status: 200 })
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 })
  }
}
