import { connectDatabase } from '@/config/database'
import WalletModel from '@/models/WalletModel'
import { getToken } from 'next-auth/jwt'
import { NextRequest, NextResponse } from 'next/server'

// Models: Wallet
import '@/models/WalletModel'

// [DELETE]: /wallet/:id/delete
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  console.log('- Delete Wallet -')

  try {
    // connect to database
    await connectDatabase()

    const token = await getToken({ req })
    const userId = token?._id

    // check if user is logged in
    if (!userId) {
      return NextResponse.json({ message: 'Please login to continue' }, { status: 401 })
    }

    // get wallet id form params
    const { id } = await params

    // count wallets
    const walletCount = await WalletModel.countDocuments({ user: userId }).lean()

    if (walletCount <= 1) {
      return NextResponse.json({ message: 'You cannot delete your final wallet' }, { status: 400 })
    }

    // delete wallet
    let wallet = await WalletModel.findByIdAndDelete(id).lean()

    if (!wallet) {
      return NextResponse.json({ message: 'Wallet not found' }, { status: 404 })
    }

    // return response
    return NextResponse.json({ wallet, message: 'Deleted wallet' }, { status: 200 })
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 })
  }
}
