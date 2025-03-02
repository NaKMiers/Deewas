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
    const { name, amount, date } = await req.json()

    // update transaction
    const oldTx: any = await TransactionModel.findByIdAndUpdate(
      id,
      { $set: { name, amount, date: toUTC(date) } },
      { new: false } // return old document
    ).lean()

    // check if transaction not found
    if (!oldTx) {
      return NextResponse.json({ message: 'Transaction not found' }, { status: 404 })
    }

    // amount is changed
    if (oldTx.amount !== amount) {
      const diffAmount = amount - oldTx.amount

      await Promise.all([
        // get new updated transaction
        // update category amount of this transaction
        CategoryModel.findByIdAndUpdate(oldTx.category, { $inc: { amount: diffAmount } }),
        // update wallet amount of this transaction
        WalletModel.findByIdAndUpdate(oldTx.wallet, { $inc: { [oldTx.type]: diffAmount } }),
        // update budgets
        BudgetModel.updateMany(
          {
            category: oldTx.category,
            begin: { $lte: oldTx.date },
            end: { $gte: oldTx.date },
          },
          { $inc: { amount: diffAmount } }
        ),
      ])
    }

    // get new updated transaction
    const transaction = await TransactionModel.findById(id).populate('category wallet').lean()

    if (!transaction) {
      return NextResponse.json({ message: 'Transaction not found' }, { status: 404 })
    }

    // return response
    return NextResponse.json({ transaction, message: 'Updated transaction' }, { status: 200 })
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 })
  }
}
