import { connectDatabase } from '@/config/database'
import { extractToken } from '@/lib/utils'
import BudgetModel from '@/models/BudgetModel'
import CategoryModel from '@/models/CategoryModel'
import TransactionModel from '@/models/TransactionModel'
import WalletModel from '@/models/WalletModel'
import { NextRequest, NextResponse } from 'next/server'

import '@/models/BudgetModel'
import '@/models/CategoryModel'
import '@/models/TransactionModel'
import '@/models/WalletModel'

import moment from 'moment-timezone'

export const dynamic = 'force-dynamic'

// [GET]: /user/stats
export async function GET(req: NextRequest) {
  console.log('- Get Stat -')

  try {
    const token = await extractToken(req)
    const userId = token?._id as string

    if (!userId) {
      return NextResponse.json({ message: 'Please login to continue' }, { status: 401 })
    }

    await connectDatabase()

    const [transactions, walletCount, categoryCount, budgetCount] = await Promise.all([
      TransactionModel.find({ user: userId }).sort({ createdAt: 1 }).lean(),
      WalletModel.countDocuments({ user: userId }),
      CategoryModel.countDocuments({ user: userId }),
      BudgetModel.countDocuments({ user: userId }),
    ])

    // streak calculation
    let curStreak = 0
    let longestStreak = 0
    let lastDate: string | null = null

    const uniqueDates = Array.from(
      new Set(transactions.map(tx => moment(tx.createdAt).format('YYYY-MM-DD')))
    )

    for (let i = 0; i < uniqueDates.length; i++) {
      const currentDate = uniqueDates[i]

      if (lastDate) {
        const expectedNext = moment(lastDate).add(1, 'day').format('YYYY-MM-DD')
        if (currentDate === expectedNext) {
          curStreak++
        } else {
          longestStreak = Math.max(longestStreak, curStreak)
          curStreak = 1
        }
      } else {
        curStreak = 1
      }

      lastDate = currentDate
    }

    longestStreak = Math.max(longestStreak, curStreak)

    const fromDate = moment().subtract(10, 'days').startOf('day')
    const recentTransactions = transactions.filter(tx => moment(tx.createdAt).isSameOrAfter(fromDate))

    return NextResponse.json(
      {
        transactionCount: transactions.length,
        recentTransactions,
        walletCount,
        categoryCount,
        budgetCount,
        currentStreak: curStreak,
        longestStreak,
      },
      { status: 200 }
    )
  } catch (err: any) {
    console.error(err)
    return NextResponse.json({ message: err.message }, { status: 500 })
  }
}
