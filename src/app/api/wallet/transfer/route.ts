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
    // connect to database
    await connectDatabase()

    const token = await getToken({ req })
    const userId = token?._id

    // check if user is logged in
    if (!userId) {
      return NextResponse.json({ message: 'Please login to continue' }, { status: 401 })
    }

    // get data from request
    const { fromWalletId, toWalletId, amount, date } = await req.json()

    console.log('fromWalletId:', fromWalletId)
    console.log('toWalletId:', toWalletId)
    console.log('amount:', amount)
    console.log('date:', date)

    const [fromWallet, toWallet, transferCategory] = await Promise.all([
      WalletModel.findById(fromWalletId).select('name'),
      WalletModel.findById(toWalletId).select('name'),
      CategoryModel.findOne({ deletable: false, type: 'transfer' }).select('_id'),
    ])

    if (!fromWallet) {
      return NextResponse.json({ message: 'Source wallet not found' }, { status: 404 })
    }

    if (!toWallet) {
      return NextResponse.json({ message: 'Destination wallet not found' }, { status: 404 })
    }

    if (!transferCategory) {
      return NextResponse.json({ message: 'Cannot categorized this action' }, { status: 404 })
    }

    console.log('fromWallet:', fromWallet)
    console.log('toWallet:', toWallet)
    console.log('transferCategory:', transferCategory)

    await Promise.all([
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

      // update from wallet
      WalletModel.findByIdAndUpdate(fromWalletId, { $inc: { transfer: -amount } }),

      // update to wallet
      WalletModel.findByIdAndUpdate(toWalletId, { $inc: { transfer: amount } }),
    ])

    // return response
    return NextResponse.json({ message: 'Transferred fund' }, { status: 200 })
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 })
  }
}
