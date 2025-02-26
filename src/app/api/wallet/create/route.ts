import { connectDatabase } from '@/config/database'
import WalletModel from '@/models/WalletModel'
import { getToken } from 'next-auth/jwt'
import { NextRequest, NextResponse } from 'next/server'

// Models: Wallet
import '@/models/WalletModel'

// [POST]: /wallet/create
export async function POST(req: NextRequest) {
  console.log('- Create Wallet -')

  try {
    // connect to database
    await connectDatabase()

    const token = await getToken({ req })
    const userId = token?._id

    // check if user is logged in
    if (!userId) {
      return NextResponse.json({ message: 'Please login to continue' }, { status: 401 })
    }

    // get data from request body
    const { name, icon } = await req.json()

    // create wallet
    const wallet = await WalletModel.create({
      name,
      icon,
      user: userId,
    })

    // return response
    return NextResponse.json({ wallet, message: 'Created wallet' }, { status: 200 })
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 })
  }
}
