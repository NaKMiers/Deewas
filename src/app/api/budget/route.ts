import { connectDatabase } from '@/config/database'
import { toUTC } from '@/lib/time'
import BudgetModel from '@/models/BudgetModel'
import moment from 'moment-timezone'
import { getToken } from 'next-auth/jwt'
import { NextRequest, NextResponse } from 'next/server'

// Models: Budget, Category
import '@/models/BudgetModel'
import '@/models/CategoryModel'

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

    // get budgets: budgets.end > today
    const budgets = await BudgetModel.find({
      user: userId,
      end: { $gte: toUTC(moment().toDate()) },
    })
      .populate('category')
      .lean()

    // return response
    return NextResponse.json({ budgets, message: 'Budgets are here' }, { status: 200 })
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 })
  }
}
