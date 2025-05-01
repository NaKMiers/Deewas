import { checkPremium, extractToken } from '@/lib/utils'
import { NextRequest, NextResponse } from 'next/server'
import { createWallet } from '..'

// [POST]: /wallet/create
export async function POST(req: NextRequest) {
  console.log('- Create Wallet -')

  try {
    const token = await extractToken(req)
    const userId = token?._id as string

    // check if user is logged in
    if (!userId) {
      return NextResponse.json({ message: 'Please login to continue' }, { status: 401 })
    }

    const isPremium = checkPremium(token)

    // get data from request body
    const { name, icon } = await req.json()

    const response = await createWallet(userId, isPremium, name, icon)

    // return response
    return NextResponse.json(response, { status: 200 })
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 })
  }
}
