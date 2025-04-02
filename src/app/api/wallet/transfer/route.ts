import { extractToken } from '@/lib/utils'
import { NextRequest, NextResponse } from 'next/server'
import { transfer } from '..'

// [POST]: /wallet/transfer
export async function POST(req: NextRequest) {
  console.log('- Transfer Funds -')

  try {
    const token = await extractToken(req)
    const userId = token?._id as string

    // check if user is logged in
    if (!userId) {
      return NextResponse.json({ message: 'Please login to continue' }, { status: 401 })
    }

    // get data from request
    const { fromWalletId, toWalletId, amount, date } = await req.json()

    const response = await transfer(userId, fromWalletId, toWalletId, amount, date)

    // return response
    return NextResponse.json(response, { status: 200 })
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 })
  }
}
