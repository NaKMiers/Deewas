import { extractToken } from '@/lib/utils'
import { NextRequest, NextResponse } from 'next/server'
import { getWallet } from '..'

export const dynamic = 'force-dynamic'

// [GET]: /wallet/:id
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  console.log('- Get Wallet -')

  try {
    const token = await extractToken(req)
    const userId = token?._id as string

    // check if user is logged in
    if (!userId) {
      return NextResponse.json({ message: 'Please login to continue' }, { status: 401 })
    }

    // get wallet id from params
    const { id } = await params

    const response = await getWallet(id, userId)

    // return response
    return NextResponse.json(response, { status: 200 })
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 })
  }
}
