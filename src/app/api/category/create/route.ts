import { extractToken } from '@/lib/utils'
import { NextRequest, NextResponse } from 'next/server'
import { createCategory } from '..'

// [POST]: /category/create
export async function POST(req: NextRequest) {
  console.log('- Create Category -')

  try {
    const token = await extractToken(req)
    const userId = token?._id as string

    // check if user is logged in
    if (!userId) {
      return NextResponse.json({ message: 'Please login to continue' }, { status: 401 })
    }

    // get data from request body
    const { name, icon, type } = await req.json()

    const response = await createCategory(userId, name, icon, type)

    // return response
    return NextResponse.json(response, { status: 200 })
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 })
  }
}
