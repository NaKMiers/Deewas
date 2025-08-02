import { connectDatabase } from '@/config/database'
import UserModel, { IUser } from '@/models/UserModel'
import { NextRequest, NextResponse } from 'next/server'

import BudgetModel from '@/models/BudgetModel'
import CategoryModel from '@/models/CategoryModel'
import SettingsModel from '@/models/SettingsModel'
import TransactionModel from '@/models/TransactionModel'
import WalletModel from '@/models/WalletModel'

// Models: User, Budget, Category, Settings, Transaction, Wallet
import '@/models/BudgetModel'
import '@/models/CategoryModel'
import '@/models/SettingsModel'
import '@/models/TransactionModel'
import '@/models/UserModel'
import '@/models/WalletModel'

// [DELETE]: /admin/user/:id/delete
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  console.log('- Delete User - ')

  try {
    const { id } = await params
    const { isForce } = await req.json()

    // connect to database
    await connectDatabase()

    if (isForce) {
      const user: IUser | null = await UserModel.findById(id)

      // check if user does not exist
      if (!user) {
        return NextResponse.json({ message: 'User not found' }, { status: 404 })
      }

      // user should be soft deleted
      if (!user.isDeleted) {
        return NextResponse.json({ message: 'User must be soft deleted first' }, { status: 400 })
      }

      await Promise.all([
        // delete all wallets
        WalletModel.deleteMany({ user: id }),
        // delete all categories
        CategoryModel.deleteMany({ user: id }),
        // delete all budgets
        BudgetModel.deleteMany({ user: id }),
        // delete all transactions
        TransactionModel.deleteMany({ user: id }),
        // delete settings
        SettingsModel.deleteOne({ user: id }),
        // delete user
        UserModel.findByIdAndDelete(id),
      ])
    } else {
      await UserModel.findByIdAndUpdate(id, { $set: { isDeleted: true } })
    }

    return NextResponse.json({ message: 'User deleted successfully' }, { status: 200 })
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 })
  }
}
