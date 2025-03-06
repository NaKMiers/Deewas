import { getToken } from 'next-auth/jwt'
import { NextRequest, NextResponse } from 'next/server'
import { deleteBudget } from '../..'

// [DELETE]: /budget/:id/delete
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  console.log('- Delete Budget -')

  try {
    const token = await getToken({ req })
    const userId = token?._id

    // check if user is logged
    if (!userId) {
      return NextResponse.json({ message: 'Please login to continue' }, { status: 401 })
    }

    // get budget id from params
    const { id } = await params

    const response = await deleteBudget(id)

    // return response
    return NextResponse.json(response, { status: 200 })
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 })
  }
}
