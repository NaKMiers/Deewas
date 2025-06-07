import { searchParamsToObject } from '@/lib/query'
import { extractToken } from '@/lib/utils'
import { NextRequest, NextResponse } from 'next/server'
import { getTransactions } from '.'

export const dynamic = 'force-dynamic'

// [GET]: /transaction
export async function GET(req: NextRequest) {
  console.log('- Get Transactions -')

  try {
    const token = await extractToken(req)
    const userId = token?._id as string

    // check if user is logged in
    if (!userId) {
      return NextResponse.json({ message: 'Please login to continue' }, { status: 401 })
    }

    const response = await getTransactions(userId, searchParamsToObject(req.nextUrl.searchParams))

    // return response
    return NextResponse.json(response, { status: 200 })
  } catch (err: any) {
    return NextResponse.json({ message: err.message || err.error }, { status: 500 })
  }
}
