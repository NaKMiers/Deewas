import { connectDatabase } from '@/config/database'
import { toUTC } from '@/lib/time'
import BudgetModel from '@/models/BudgetModel'
import moment from 'moment-timezone'
import { getToken } from 'next-auth/jwt'
import { NextRequest, NextResponse } from 'next/server'

// Models: Budget, Wallet, Category
import '@/models/BudgetModel'
import '@/models/CategoryModel'
import '@/models/WalletModel'

export const dynamic = 'force-dynamic'

// [GET]: /budget
export async function GET(req: NextRequest) {
  console.log('- Get My Budgets -')

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

    // check if wallet is chosen
    if (!walletId) {
      return NextResponse.json({ message: 'Select your wallet to see budgets' }, { status: 400 })
    }

    // get budgets: budgets.end > today
    const budgets = await BudgetModel.find({
      user: userId,
      wallet: walletId,
      end: { $gte: toUTC(moment().toDate()) },
      deleted: false,
    })
      .populate('wallet category')
      .lean()

    // return response
    return NextResponse.json({ budgets, message: 'Budgets are here' }, { status: 200 })
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 })
  }
}
