import { extractToken } from '@/lib/utils'
import { NextRequest, NextResponse } from 'next/server'
import { updateUser } from '..'

// [PUT]: /user/update
export async function PUT(req: NextRequest) {
  console.log('- Update User - ')

  try {
    const token = await extractToken(req)
    const userId = token?._id as string

    // check if user is logged in
    if (!userId) {
      return NextResponse.json({ message: 'Please login to continue' }, { status: 401 })
    }

    // get date from request body
    const data = await req.json()
    const response = await updateUser(userId, data)

    // return response
    return NextResponse.json(response, { status: 200 })
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 })
  }
}
