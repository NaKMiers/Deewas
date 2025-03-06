import { connectDatabase } from '@/config/database'
import { toUTC } from '@/lib/time'
import BudgetModel from '@/models/BudgetModel'
import CategoryModel from '@/models/CategoryModel'
import TransactionModel, { TransactionType } from '@/models/TransactionModel'
import WalletModel from '@/models/WalletModel'
import { getToken } from 'next-auth/jwt'
import { NextRequest, NextResponse } from 'next/server'

// Models: Transaction, Category, Wallet, Budget
import '@/models/BudgetModel'
import '@/models/CategoryModel'
import '@/models/TransactionModel'
import '@/models/WalletModel'

// [POST]: /transaction/create
export async function POST(req: NextRequest) {
  console.log('- Create Transaction - ')

  try {
    const token = await getToken({ req })
    const userId = token?._id as string

    // check if user is logged in
    if (!userId) {
      return NextResponse.json({ message: 'Please login to continue' }, { status: 401 })
    }

    // get data from request
    const { walletId, categoryId, name, amount, date, type } = await req.json()

    const response = await createTransaction(userId, walletId, categoryId, name, amount, date, type)

    // return response
    return NextResponse.json(response, { status: 200 })
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 })
  }
}

export const createTransaction = async (
  userId: string,
  walletId: string,
  categoryId: string,
  name: string,
  amount: number,
  date: string,
  type: TransactionType
) => {
  try {
    // connect to database
    await connectDatabase()

    // connect to database
    await connectDatabase()

    // create transaction
    const newTx = await TransactionModel.create({
      user: userId,
      wallet: walletId,
      category: categoryId,
      name,
      amount,
      date: toUTC(date),
      type,
    })

    // update category amount and wallet
    const [transaction] = await Promise.all([
      // get new transaction
      TransactionModel.findById(newTx._id).populate('category wallet'),
      // update category amount
      CategoryModel.findByIdAndUpdate(categoryId, { $inc: { amount } }),
      // update wallet
      WalletModel.findByIdAndUpdate(walletId, { $inc: { [type]: amount } }),
      // update budgets
      BudgetModel.updateMany(
        {
          category: categoryId,
          begin: { $lte: toUTC(date) },
          end: { $gte: toUTC(date) },
        },
        { $inc: { amount } }
      ),
    ])

    return { transaction: JSON.parse(JSON.stringify(transaction)), message: 'Created transaction' }
  } catch (err: any) {
    throw new Error(err)
  }
}
