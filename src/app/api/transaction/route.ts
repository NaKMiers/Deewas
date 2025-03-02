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
    const sort = searchParams.get('sort') || 'date'
    const orderBy = parseInt(searchParams.get('orderBy') || '-1', 10) as 1 | -1
    const limit = searchParams.get('limit') || Infinity

    const filter: any = { user: userId }
    if (walletId) filter.wallet = walletId
    if (from) filter.date = { $gte: toUTC(from) }
    if (to) filter.date = { ...filter.date, $lte: toUTC(to) }

    // MARK: Overview
    const transactions = await TransactionModel.find(filter)
      .populate('wallet category')
      .sort({ [sort]: orderBy })
      .limit(+limit)
      .lean()

    // return response
    return NextResponse.json({ transactions, message: 'Transactions are here' }, { status: 200 })
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 })
  }
}
