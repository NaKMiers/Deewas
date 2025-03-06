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
    const token = await getToken({ req })
    const userId = token?._id as string

    // check if user is logged in
    if (!userId) {
      return NextResponse.json({ message: 'Please login to continue' }, { status: 401 })
    }

    // get wallet id form params
    const { id } = await params

    const response = await deleteWallet(userId, id)

    return NextResponse.json(response, { status: 200 })
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 })
  }
}

export const deleteWallet = async (userId: string, walletId: string) => {
  try {
    // connect to database
    await connectDatabase()

    const [walletCount]: any[] = await Promise.all([
      // count wallets
      WalletModel.countDocuments({ user: userId }).lean(),
      // delete all transactions associated with wallet
      TransactionModel.deleteMany({ wallet: walletId }),
    ])

    // clear wallet if only one wallet is left
    if (walletCount > 1) {
      // delete wallet
      const wallet = await WalletModel.findByIdAndDelete(walletId)
      return { wallet, message: 'Deleted wallet' }
    } else {
      const wallet = await WalletModel.findByIdAndUpdate(
        walletId,
        { $set: { income: 0, expense: 0, saving: 0, invest: 0 } },
        { new: true }
      )
      return { wallet: JSON.parse(JSON.stringify(wallet)), message: 'Cleared wallet' }
    }
  } catch (err: any) {
    throw new Error(err)
  }
}
