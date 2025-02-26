import { connectDatabase } from '@/config/database'
import WalletModel from '@/models/WalletModel'
import { getToken } from 'next-auth/jwt'
import { NextRequest, NextResponse } from 'next/server'

// [GET]: /wallet
export async function GET(req: NextRequest) {
  console.log('- Get My Wallets -')

  try {
    // connect to database
    await connectDatabase()

    const token = await getToken({ req })
    const userId = token?._id

    // check if user is logged in
    if (!userId) {
      return NextResponse.json({ message: 'Please login to continue' }, { status: 401 })
    }

    // get user wallets
    const wallets = await WalletModel.find({ user: userId, deleted: false }).lean()

    // return response
    return NextResponse.json({ wallets, message: 'Wallets are here' }, { status: 200 })
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 })
  }
}
