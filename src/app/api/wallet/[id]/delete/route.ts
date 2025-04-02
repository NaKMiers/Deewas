import { extractToken } from '@/lib/utils'
import { NextRequest, NextResponse } from 'next/server'
import { deleteWallet } from '../..'

// [DELETE]: /wallet/:id/delete
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  console.log('- Delete Wallet -')

  try {
    const token = await extractToken(req)
    const userId = token?._id as string

    // check if user is logged in
    if (!userId) {
      return NextResponse.json({ message: 'Please login to continue' }, { status: 401 })
    }

    // get wallet id form params
    const { id } = await params

    const response = await deleteWallet(userId, id)

    return NextResponse.json(response, { status: 200 })
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 })
  }
}
