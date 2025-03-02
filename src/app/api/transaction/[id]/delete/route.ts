import { connectDatabase } from '@/config/database'
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

// [DELETE]: /transaction/:id/delete
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  console.log('- Delete Transaction - ')

  try {
    // connect to database
    await connectDatabase()

    const token = await getToken({ req })
    const userId = token?._id

    // check if user is logged in
    if (!userId) {
      return NextResponse.json({ message: 'Please login to continue' }, { status: 401 })
    }

    // get transaction id to delete
    const { id } = await params

    // delete transaction
    const transaction: any = await TransactionModel.findByIdAndDelete(id).lean()

    // check if transaction not found
    if (!transaction) {
      return NextResponse.json({ message: 'Transaction not found' }, { status: 404 })
    }

    await Promise.all([
      // update category amount of this transaction
      CategoryModel.findByIdAndUpdate(transaction.category, { $inc: { amount: -transaction.amount } }),
      // update wallet amount of this transaction
      WalletModel.findByIdAndUpdate(transaction.wallet, {
        $inc: { [transaction.type]: -transaction.amount },
      }),
      // update budgets
      BudgetModel.updateMany(
        {
          category: transaction.category,
          begin: { $lte: transaction.date },
          end: { $gte: transaction.date },
        },
        { $inc: { amount: -transaction.amount } }
      ),
    ])

    // return response
    return NextResponse.json({ transaction, message: 'Deleted transaction' }, { status: 200 })
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 })
  }
}
