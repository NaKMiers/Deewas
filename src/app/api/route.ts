import { connectDatabase } from '@/config/database'
import { toUTC } from '@/lib/time'
import { extractToken } from '@/lib/utils'
import BudgetModel from '@/models/BudgetModel'
import CategoryModel from '@/models/CategoryModel'
import WalletModel from '@/models/WalletModel'
import moment from 'moment-timezone'
import { NextRequest, NextResponse } from 'next/server'

// Models: Wallet, Category, Budget
import '@/models/BudgetModel'
import '@/models/CategoryModel'
import '@/models/WalletModel'

export const dynamic = 'force-dynamic'

// [GET]: /
export async function GET(req: NextRequest) {
  console.log('- INIT -')

  try {
    const token = await extractToken(req)
    const userId = token?._id as string

    // check if user is logged in
    if (!userId) {
      return NextResponse.json({ message: 'Please login to continue' }, { status: 401 })
    }

    // connect to database
    await connectDatabase()

    const [wallets, categories, budgets] = await Promise.all([
      // get wallets
      WalletModel.find({ user: userId }).sort({ createdAt: 1 }).lean(),
      CategoryModel.find({ user: userId }).sort({ createdAt: -1 }).lean(),
      BudgetModel.find({ user: userId, end: { $gte: toUTC(moment().toDate()) } })
        .populate('category')
        .sort({ end: 1, createdAt: -1 })
        .lean(),
    ])

    // return response
    return NextResponse.json({ wallets, categories, budgets }, { status: 200 })
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 })
  }
}
