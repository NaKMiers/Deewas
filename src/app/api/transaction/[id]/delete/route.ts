import { extractToken } from '@/lib/utils'
import { NextRequest, NextResponse } from 'next/server'
import { deleteTransaction } from '../..'

// [DELETE]: /transaction/:id/delete
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  console.log('- Delete Transaction - ')

  try {
    const token = await extractToken(req)
    const userId = token?._id

    // check if user is logged in
    if (!userId) {
      return NextResponse.json({ message: 'Please login to continue' }, { status: 401 })
    }

    // get transaction id to delete
    const { id } = await params

    const response = await deleteTransaction(id)

    // return response
    return NextResponse.json(response, { status: 200 })
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 })
  }
}
