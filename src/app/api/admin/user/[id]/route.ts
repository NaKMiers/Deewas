import { connectDatabase } from '@/config/database'
import BudgetModel from '@/models/BudgetModel'
import SettingsModel from '@/models/SettingsModel'
import TransactionModel from '@/models/TransactionModel'
import UserModel from '@/models/UserModel'
import WalletModel from '@/models/WalletModel'
import { NextRequest, NextResponse } from 'next/server'

// Models: User, Wallet, Transactions, Category, Budget, Settings
import '@/models/BudgetModel'
import '@/models/CategoryModel'
import '@/models/SettingsModel'
import '@/models/TransactionModel'
import '@/models/UserModel'
import '@/models/WalletModel'

// [GET]: /admin/user/:id
export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  console.log('- Get User -')

  try {
    const { id } = await params

    // connect to database
    await connectDatabase()

    // get user
    const user = await UserModel.findById(id).lean()

    // check if user not found
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 })
    }

    const [wallets, transactions, budgets, settings] = await Promise.all([
      WalletModel.find({ user: id }).lean(),
      TransactionModel.find({ user: id }).populate('category', 'name icon amount').lean(),
      BudgetModel.find({ user: id }).populate('category', 'name icon amount').lean(),
      SettingsModel.findOne({ user: id }).select('currency').lean(),
    ])

    // return response
    return NextResponse.json({ user, wallets, transactions, budgets, settings }, { status: 200 })
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 })
  }
}
