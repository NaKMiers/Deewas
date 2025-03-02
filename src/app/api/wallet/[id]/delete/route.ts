import { connectDatabase } from '@/config/database'
import TransactionModel from '@/models/TransactionModel'
import WalletModel from '@/models/WalletModel'
import { getToken } from 'next-auth/jwt'
import { NextRequest, NextResponse } from 'next/server'

// Models: Wallet, Transaction
import '@/models/TransactionModel'
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

    const [walletCount]: any[] = await Promise.all([
      // count wallets
      WalletModel.countDocuments({ user: userId }).lean(),
      // delete all transactions associated with wallet
      TransactionModel.deleteMany({ wallet: id }),
    ])

    // clear wallet if only one wallet is left
    if (walletCount > 1) {
      // delete wallet
      const wallet = await WalletModel.findByIdAndDelete(id)
      return NextResponse.json({ wallet, message: 'Deleted wallet' }, { status: 200 })
    } else {
      const wallet = await WalletModel.findByIdAndUpdate(
        id,
        { $set: { income: 0, expense: 0, saving: 0, invest: 0 } },
        { new: true }
      )
      return NextResponse.json({ wallet, message: 'Cleared wallet' }, { status: 200 })
    }
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 })
  }
}
