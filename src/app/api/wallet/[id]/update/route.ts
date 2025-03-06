import { connectDatabase } from '@/config/database'
import WalletModel from '@/models/WalletModel'
import { getToken } from 'next-auth/jwt'
import { NextRequest, NextResponse } from 'next/server'

// Models: Wallet
import '@/models/WalletModel'

// [PUT]: /wallet/:id/update
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  console.log('- Update Wallet -')

  try {
    const token = await getToken({ req })
    const userId = token?._id

    // check if user is logged in
    if (!userId) {
      return NextResponse.json({ message: 'Please login to continue' }, { status: 401 })
    }

    // get wallet id from request params
    const { id } = await params

    // get data from request body
    const { name, icon, hide } = await req.json()

    const response = await updateWallet(id, name, icon, hide)

    // return response
    return NextResponse.json(response, { status: 200 })
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 })
  }
}

export const updateWallet = async (walletId: string, name: string, icon: string, hide: string) => {
  // connect to database
  await connectDatabase()

  // update wallet
  const wallet = await WalletModel.findByIdAndUpdate(
    walletId,
    { $set: { name, icon, hide } },
    { new: true }
  ).lean()

  return { wallet: JSON.parse(JSON.stringify(wallet)), message: 'Updated wallet' }
}
