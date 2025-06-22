import { connectDatabase } from '@/config/database'
import { toUTC } from '@/lib/time'
import { checkPremium, extractToken } from '@/lib/utils'
import BudgetModel from '@/models/BudgetModel'
import CategoryModel from '@/models/CategoryModel'
import SettingsModel from '@/models/SettingsModel'
import WalletModel from '@/models/WalletModel'
import moment from 'moment-timezone'
import { NextRequest, NextResponse } from 'next/server'

// Models: Wallet, Category, Budget, Settings
import '@/models/BudgetModel'
import '@/models/CategoryModel'
import '@/models/SettingsModel'
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

    const promises: any[] = [
      WalletModel.find({ user: userId }).sort({ updatedAt: -1 }).lean(),
      CategoryModel.find({ user: userId }).sort({ createdAt: -1 }).lean(),
      BudgetModel.find({ user: userId, end: { $gte: toUTC(moment().toDate()) } })
        .populate('category')
        .sort({ end: 1, createdAt: -1 })
        .lean(),
      SettingsModel.findOne({ user: userId }).lean(),
    ]

    const [wallets, categories, budgets, settings]: any[] = await Promise.all(promises)

    // reset (free tokens and free scan) for free user after a day
    if (settings && moment(settings.updatedAt).isBefore(moment().startOf('day'))) {
      await SettingsModel.updateOne({ user: userId }, { $set: { freeTokensUsed: 0, scanned: 0 } })
    }

    // return response
    return NextResponse.json({ wallets, categories, budgets, settings }, { status: 200 })
  } catch (err: any) {
    return NextResponse.json({ message: err.message || err.error }, { status: 500 })
  }
}
