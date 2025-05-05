import { checkPremium, extractToken } from '@/lib/utils'
import { NextRequest, NextResponse } from 'next/server'
import { createBudget } from '..'

// [POST]: /budget/create
export async function POST(req: NextRequest) {
  console.log('- Create Budget -')

  try {
    const token = await extractToken(req)
    const userId = token?._id as string

    // check if user is logged
    if (!userId) {
      return NextResponse.json({ message: 'Please login to continue' }, { status: 401 })
    }

    const isPremium = checkPremium(token)
    console.log('isPremium', isPremium)

    // get data from request body
    const { categoryId, total, begin, end } = await req.json()

    const response = await createBudget(userId, isPremium, categoryId, begin, end, total)

    // return response
    return NextResponse.json(response, { status: 200 })
  } catch (err: any) {
    return NextResponse.json({ message: err.message || err.error }, { status: 500 })
  }
}
