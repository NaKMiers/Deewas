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
    const token = await getToken({ req })
    const userId = token?._id as string

    // check if user is logged in
    if (!userId) {
      return NextResponse.json({ message: 'Please login to continue' }, { status: 401 })
    }

    const { searchParams } = new URL(req.nextUrl)
    const params = Object.fromEntries(searchParams.entries())

    const response = await getBudgets(userId, params)

    // return response
    return NextResponse.json(response, { status: 200 })
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 })
  }
}

export const getBudgets = async (userId: string, params: any = {}) => {
  try {
    // connect to database
    await connectDatabase()

    console.log('params', params)

    const filter: any = { user: userId, end: { $gte: toUTC(moment().toDate()) } }
    Object.keys(params).forEach(key => {
      if (params[key]) {
        filter[key] = params[key]
      }
    })

    console.log('filter', filter)

    // get budgets: budgets.end > today
    const budgets = await BudgetModel.find(filter).populate('category').lean()

    return { budgets: JSON.parse(JSON.stringify(budgets)), message: 'Budgets are here' }
  } catch (err: any) {
    throw new Error(err.message)
  }
}
