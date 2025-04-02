import { extractToken } from '@/lib/utils'
import { NextRequest, NextResponse } from 'next/server'
import { updateCategory } from '../..'

// [PUT]: /category/:id/update
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  console.log('- Update Category -')

  try {
    const token = await extractToken(req)
    const userId = token?._id

    // check if user is logged in
    if (!userId) {
      return NextResponse.json({ message: 'Please login to continue' }, { status: 401 })
    }

    // get category id from request params
    const { id } = await params

    // get data from request body
    const { name, icon } = await req.json()

    const response = await updateCategory(id, name, icon)

    // return response
    return NextResponse.json(response, { status: 200 })
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 })
  }
}
