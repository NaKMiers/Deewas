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
    const token = await getToken({ req })
    const userId = token?._id as string

    // check if user is logged in
    if (!userId) {
      return NextResponse.json({ message: 'Please login to continue' }, { status: 401 })
    }

    const { searchParams } = new URL(req.nextUrl)
    const params = Object.fromEntries(searchParams.entries())

    const response = await getTransactions(userId, params)

    // return response
    return NextResponse.json(response, { status: 200 })
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 })
  }
}

export const getTransactions = async (userId: string, params: any = {}) => {
  try {
    // connect to database
    await connectDatabase()

    const { walletId, from, to, type, amount, name } = params

    console.log('Params:', params)

    const sort = params.sort || 'date'
    const orderBy = parseInt(params.orderBy || '-1', 10) as 1 | -1
    const limit = params.limit || Infinity

    const filter: any = { user: userId }
    if (walletId) filter.wallet = walletId
    if (from) filter.date = { $gte: toUTC(from) }
    if (to) filter.date = { ...filter.date, $lte: toUTC(to) }
    if (type) filter.type = type
    if (amount) filter.amount = amount
    if (name) filter.name = { $regex: name, $options: 'i' }

    // MARK: Overview
    const transactions = await TransactionModel.find(filter)
      .populate('wallet category')
      .sort({ [sort]: orderBy })
      .limit(+limit)
      .lean()

    return { transactions: JSON.parse(JSON.stringify(transactions)), message: 'Transactions are here' }
  } catch (err: any) {
    throw new Error(err)
  }
}
