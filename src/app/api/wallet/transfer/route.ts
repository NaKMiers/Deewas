import { connectDatabase } from '@/config/database'
import CategoryModel from '@/models/CategoryModel'
import TransactionModel from '@/models/TransactionModel'
import WalletModel from '@/models/WalletModel'
import { getToken } from 'next-auth/jwt'
import { NextRequest, NextResponse } from 'next/server'

// Models: Wallet, Transaction, Category
import { toUTC } from '@/lib/time'
import '@/models/CategoryModel'
import '@/models/TransactionModel'
import '@/models/WalletModel'

// [POST]: /wallet/transfer
export async function POST(req: NextRequest) {
  console.log('- Transfer Funds -')

  try {
    const token = await getToken({ req })
    const userId = token?._id as string

    // check if user is logged in
    if (!userId) {
      return NextResponse.json({ message: 'Please login to continue' }, { status: 401 })
    }

    // get data from request
    const { fromWalletId, toWalletId, amount, date } = await req.json()

    const response = await transfer(userId, fromWalletId, toWalletId, amount, date)

    // return response
    return NextResponse.json(response, { status: 200 })
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 })
  }
}

export const transfer = async (
  userId: string,
  fromWalletId: string,
  toWalletId: string,
  amount: number,
  date: string
) => {
  try {
    // connect to database
    await connectDatabase()

    const [fromWallet, toWallet, transferCategory] = await Promise.all([
      WalletModel.findById(fromWalletId).select('name'),
      WalletModel.findById(toWalletId).select('name'),
      CategoryModel.findOne({ deletable: false, type: 'transfer' }).select('_id'),
    ])

    if (!fromWallet) {
      throw new Error('Source wallet not found')
    }

    if (!toWallet) {
      throw new Error('Destination wallet not found')
    }

    if (!transferCategory) {
      throw new Error('Cannot categorized this action')
    }

    const [sourceW, destinationW] = await Promise.all([
      // update from wallet
      WalletModel.findByIdAndUpdate(fromWalletId, { $inc: { transfer: -amount } }, { new: true }),

      // update to wallet
      WalletModel.findByIdAndUpdate(toWalletId, { $inc: { transfer: amount } }, { new: true }),

      // create transfer transactions
      TransactionModel.create({
        user: userId,
        wallet: fromWalletId,
        category: transferCategory._id,
        type: 'transfer',
        name: `Transferred from ${fromWallet.name} to ${toWallet.name}`,
        amount: -amount,
        date: toUTC(date),
      }),

      // create transfer transactions
      TransactionModel.create({
        user: userId,
        wallet: toWalletId,
        category: transferCategory._id,
        type: 'transfer',
        name: `Transferred from ${fromWallet.name} to ${toWallet.name}`,
        amount: amount,
        date: toUTC(date),
      }),
    ])

    return {
      sourceWallet: JSON.parse(JSON.stringify(sourceW)),
      destinationWallet: JSON.parse(JSON.stringify(destinationW)),
      message: 'Funds transferred',
    }
  } catch (err: any) {
    throw new Error(err)
  }
}
