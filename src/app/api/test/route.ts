import { connectDatabase } from '@/config/database'
import CategoryModel from '@/models/CategoryModel'
import TransactionModel from '@/models/TransactionModel'
import WalletModel from '@/models/WalletModel'
import { NextRequest, NextResponse } from 'next/server'

// [GET]: /test
export async function GET(req: NextRequest) {
  console.log('Test API')

  try {
    // connect to database
    await connectDatabase()

    // move all saving & invest transactions to uncategorized income
    const transactions = await TransactionModel.find({
      type: { $in: ['saving', 'invest'] },
    }).lean()

    for (const transaction of transactions) {
      const uncategorizedCat: any = await CategoryModel.findOne({
        deletable: false,
        type: 'income',
        user: transaction.user,
      }).lean()

      if (!uncategorizedCat) {
        console.log('No uncategorized category found for user:', transaction.user)
        continue
      }

      await TransactionModel.findByIdAndUpdate(transaction._id, {
        $set: { category: uncategorizedCat._id, type: 'income' },
      })
    }

    // sync categories
    const allCates = await CategoryModel.find().lean()
    for (const cate of allCates) {
      const transactions = await TransactionModel.find({
        category: cate._id,
      })
        .select('amount')
        .lean()
      const amount = transactions.reduce((acc, transaction) => acc + transaction.amount, 0)

      await CategoryModel.updateOne({ _id: cate._id }, { $set: { amount } })
    }

    // sync wallets
    const allWallets = await WalletModel.find().lean()
    for (const wallet of allWallets) {
      const transactions = await TransactionModel.find({
        wallet: wallet._id,
      })
        .select('type amount')
        .lean()

      const totalIncome = transactions
        .filter(t => t.type === 'income')
        .reduce((acc, transaction) => acc + transaction.amount, 0)

      const totalExpense = transactions
        .filter(t => t.type === 'expense')
        .reduce((acc, transaction) => acc + transaction.amount, 0)

      console.log(wallet.name, transactions.length, totalIncome, totalExpense)

      await WalletModel.updateOne(
        { _id: wallet._id },
        { $set: { income: totalIncome, expense: totalExpense } }
      )
    }

    // return response
    return NextResponse.json({ message: allWallets.length }, { status: 200 })
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 })
  }
}
