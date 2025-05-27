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

import { searchParamsToObject } from '@/lib/query'
import { toUTC } from '@/lib/time'
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

    // get query params
    const params = searchParamsToObject(req.nextUrl.searchParams)
    const { from, to } = params

    if (!from?.[0] && !to?.[0]) {
      return NextResponse.json({ message: 'Please provide a date range' }, { status: 400 })
    }
    const filter: any = { user: userId }
    if (from?.[0]) filter.createdAt = { $gte: toUTC(moment(from[0]).toDate()) }
    if (to?.[0]) filter.createdAt = { ...filter.createdAt, $lte: toUTC(moment(to[0]).toDate()) }

    await connectDatabase()

    const [recentTransactions, allTransactions, walletCount, categoryCount, budgetCount] =
      await Promise.all([
        TransactionModel.find(filter).select('createdAt').sort({ createdAt: -1 }).lean(),
        TransactionModel.find().select('createdAt').sort({ createdAt: 1 }).lean(),
        WalletModel.countDocuments({ user: userId }),
        CategoryModel.countDocuments({ user: userId }),
        BudgetModel.countDocuments({ user: userId }),
      ])

    // streak calculation
    let curStreak = 0
    let longestStreak = 0
    let lastDate: string | null = null

    const uniqueDates = Array.from(
      new Set(allTransactions.map(tx => moment(tx.createdAt).format('YYYY-MM-DD')))
    )

    console.log(`Unique Dates: ${uniqueDates}`)

    for (let i = 0; i < uniqueDates.length; i++) {
      const currentDate = uniqueDates[i]

      if (lastDate) {
        const expectedNext = moment(lastDate).add(1, 'day').format('YYYY-MM-DD')
        console.log(expectedNext, currentDate)
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

    return NextResponse.json(
      {
        recentTransactions,
        transactionCount: allTransactions.length,
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
    return NextResponse.json({ message: err.message || err.error }, { status: 500 })
  }
}
