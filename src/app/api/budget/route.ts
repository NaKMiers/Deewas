import { extractToken } from '@/lib/utils'
import { NextRequest, NextResponse } from 'next/server'
import { getBudgets } from '.'

export const dynamic = 'force-dynamic'

// [GET]: /budget
export async function GET(req: NextRequest) {
  console.log('- Get My Budgets -')

  try {
    const token = await extractToken(req)
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
