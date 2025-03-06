import { getToken } from 'next-auth/jwt'
import { NextRequest, NextResponse } from 'next/server'
import { getWallets } from '.'

// [GET]: /wallet
export async function GET(req: NextRequest) {
  console.log('- Get My Wallets -')

  try {
    const token = await getToken({ req })
    const userId = token?._id as string

    // check if user is logged in
    if (!userId) {
      return NextResponse.json({ message: 'Please login to continue' }, { status: 401 })
    }

    const response = await getWallets(userId)

    // return response
    return NextResponse.json(response, { status: 200 })
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 })
  }
}
