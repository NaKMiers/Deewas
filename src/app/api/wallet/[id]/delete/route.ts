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

    let [walletUserId, walletCount] = await Promise.all([
      // get wallet user id to check authorization
      WalletModel.findById(id).distinct('user').lean(),
      // prevent delete final wallet
      WalletModel.countDocuments({ user: userId, deleted: false }).lean(),
    ])

    // check authorization
    if (walletUserId[0].toString() !== userId) {
      return NextResponse.json({ message: 'You are now allowed to delete this wallet' }, { status: 401 })
    }

    if (walletCount <= 1) {
      return NextResponse.json({ message: 'You cannot delete your final wallet' }, { status: 400 })
    }

    // "soft" delete wallet
    let wallet = await WalletModel.findByIdAndUpdate(id, { $set: { deleted: true } }).lean()

    // return response
    return NextResponse.json({ wallet, message: 'Deleted wallet' }, { status: 200 })
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 })
  }
}
