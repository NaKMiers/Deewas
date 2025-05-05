import { searchParamsToObject } from '@/lib/query'
import { extractToken } from '@/lib/utils'
import { NextRequest, NextResponse } from 'next/server'
import { getHistory } from '..'

export const dynamic = 'force-dynamic'

// [GET]: /transaction/history
export async function GET(req: NextRequest) {
  console.log('- Get History - ')

  try {
    const token = await extractToken(req)
    const userId = token?._id as string

    // check if user is logged in
    if (!userId) {
      return NextResponse.json({ message: 'Please login to continue' }, { status: 401 })
    }

    const response = await getHistory(userId, searchParamsToObject(req.nextUrl.searchParams))

    // return response
    return NextResponse.json(response, { status: 200 })
  } catch (err: any) {
    return NextResponse.json({ message: err.message || err.error }, { status: 500 })
  }
}
