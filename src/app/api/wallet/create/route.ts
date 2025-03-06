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
    const token = await getToken({ req })
    const userId = token?._id as string

    // check if user is logged in
    if (!userId) {
      return NextResponse.json({ message: 'Please login to continue' }, { status: 401 })
    }

    // get data from request body
    const { name, icon } = await req.json()

    const response = await createWallet(userId, name, icon)

    // return response
    return NextResponse.json(response, { status: 200 })
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 })
  }
}

export const createWallet = async (userId: string, name: string, icon: string) => {
  try {
    // connect to database
    await connectDatabase()

    // create wallet
    const wallet = await WalletModel.create({
      user: userId,
      name,
      icon,
    })

    return { wallet: JSON.parse(JSON.stringify(wallet)), message: 'Created wallet' }
  } catch (err: any) {
    throw new Error(err)
  }
}
