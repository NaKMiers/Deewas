import { connectDatabase } from '@/config/database'
import CategoryModel from '@/models/CategoryModel'
import TransactionModel from '@/models/TransactionModel'
import WalletModel from '@/models/WalletModel'
import { getToken } from 'next-auth/jwt'
import { NextRequest, NextResponse } from 'next/server'

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
    const transaction: any = await TransactionModel.findByIdAndUpdate(id, {
      $set: { deleted: true },
    }).lean()

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
    ])

    // return response
    return NextResponse.json({ message: 'Deleted transaction' }, { status: 200 })
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 })
  }
}
