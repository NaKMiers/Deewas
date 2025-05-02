import { connectDatabase } from '@/config/database'
import { extractToken } from '@/lib/utils'
import BudgetModel from '@/models/BudgetModel'
import CategoryModel from '@/models/CategoryModel'
import TransactionModel from '@/models/TransactionModel'
import WalletModel from '@/models/WalletModel'
import { NextRequest, NextResponse } from 'next/server'

// Models: Wallet, Budget, Transaction, Category
import '@/models/BudgetModel'
import '@/models/CategoryModel'
import '@/models/TransactionModel'
import '@/models/WalletModel'

// [GET]: /settings/extract-all-data
export async function GET(req: NextRequest) {
  try {
    const token = await extractToken(req)
    const userId = token?._id as string

    // check if user is logged in
    if (!userId) {
      return NextResponse.json({ message: 'Please login to continue' }, { status: 404 })
    }

    // connect to database
    await connectDatabase()

    const [wallets, categories, budgets, transactions] = await Promise.all([
      WalletModel.find({ user: userId }).lean(),
      CategoryModel.find({ user: userId }).lean(),
      BudgetModel.find({ user: userId }).populate('category').lean(),
      TransactionModel.find({ user: userId }).populate('category wallet').lean(),
    ])

    // return response
    return NextResponse.json({ wallets, categories, budgets, transactions }, { status: 200 })
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 })
  }
}
