import { connectDatabase } from '@/config/database'
import { toUTC } from '@/lib/time'
import BudgetModel from '@/models/BudgetModel'
import CategoryModel from '@/models/CategoryModel'
import TransactionModel from '@/models/TransactionModel'
import WalletModel from '@/models/WalletModel'
import { getToken } from 'next-auth/jwt'
import { NextRequest, NextResponse } from 'next/server'

// Models: Transaction, Category, Wallet, Budget
import '@/models/BudgetModel'
import '@/models/CategoryModel'
import '@/models/TransactionModel'
import '@/models/WalletModel'

// [PUT]: /transaction/:id/update
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  console.log('- Update Transaction - ')

  try {
    // connect to database
    await connectDatabase()

    const token = await getToken({ req })
    const userId = token?._id

    // check if user is logged in
    if (!userId) {
      return NextResponse.json({ message: 'Please login to continue' }, { status: 401 })
    }

    // get transaction id to update
    const { id } = await params

    // get data from request
    const { name, amount, date, walletId } = await req.json()

    console.log('id:', id)
    console.log('name:', name)
    console.log('amount:', amount)
    console.log('date:', date)
    console.log('walletId:', walletId)

    // update transaction
    const oldTx: any = await TransactionModel.findByIdAndUpdate(
      id,
      { $set: { wallet: walletId, name, amount, date: toUTC(date) } },
      { new: false } // return old document
    ).lean()

    console.log('oldTx:', oldTx)

    // check if transaction not found
    if (!oldTx) {
      return NextResponse.json({ message: 'Transaction not found' }, { status: 404 })
    }

    const promises: any[] = [
      // get new updated transaction
      TransactionModel.findById(id).populate('category wallet').lean(),
    ]

    // amount is changed
    if (oldTx.amount !== amount) {
      const diffAmount = amount - oldTx.amount

      // update category amount of this transaction
      promises.push(CategoryModel.findByIdAndUpdate(oldTx.category, { $inc: { amount: diffAmount } }))

      // update budgets
      promises.push(
        BudgetModel.updateMany(
          {
            category: oldTx.category,
            begin: { $lte: oldTx.date },
            end: { $gte: oldTx.date },
          },
          { $inc: { amount: diffAmount } }
        )
      )

      if (walletId !== oldTx.wallet.toString()) {
        // update "old" wallet amount of this transaction
        promises.push(
          WalletModel.findByIdAndUpdate(oldTx.wallet, { $inc: { [oldTx.type]: -oldTx.amount } })
        )
        // update "new" wallet amount of this transaction
        promises.push(WalletModel.findByIdAndUpdate(walletId, { $inc: { [oldTx.type]: amount } }))
      } else {
        // update "old" wallet amount of this transaction
        promises.push(
          WalletModel.findByIdAndUpdate(oldTx.wallet, { $inc: { [oldTx.type]: diffAmount } })
        )
      }
    }
    // wallet is changed
    else if (walletId !== oldTx.wallet.toString()) {
      // update "old" wallet amount of this transaction
      promises.push(
        WalletModel.findByIdAndUpdate(oldTx.wallet, { $inc: { [oldTx.type]: -oldTx.amount } })
      )
      // update "new" wallet amount of this transaction
      promises.push(WalletModel.findByIdAndUpdate(walletId, { $inc: { [oldTx.type]: amount } }))
    }

    const [transaction] = await Promise.all(promises)

    // check if transaction not found
    if (!transaction) {
      return NextResponse.json({ message: 'Transaction not found' }, { status: 404 })
    }

    // return response
    return NextResponse.json({ transaction, message: 'Updated transaction' }, { status: 200 })
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 })
  }
}
