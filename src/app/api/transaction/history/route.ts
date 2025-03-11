import { getToken } from 'next-auth/jwt'
import { NextRequest, NextResponse } from 'next/server'
import { getHistory } from '..'
import { searchParamsToObject } from '@/lib/query'

// [GET]: /
export async function GET(req: NextRequest) {
  console.log('- Get History - ')

  try {
    const token = await getToken({ req })
    const userId = token?._id as string

    // check if user is logged in
    if (!userId) {
      return NextResponse.json({ message: 'Please login to continue' }, { status: 401 })
    }

    const response = await getHistory(userId, searchParamsToObject(req.nextUrl.searchParams))

    // return response
    return NextResponse.json(response, { status: 200 })
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 })
  }
}
