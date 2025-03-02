import { connectDatabase } from '@/config/database'
import BudgetModel from '@/models/BudgetModel'
import CategoryModel from '@/models/CategoryModel'
import TransactionModel from '@/models/TransactionModel'
import WalletModel from '@/models/WalletModel'
import { getToken } from 'next-auth/jwt'
import { NextRequest, NextResponse } from 'next/server'

// Models: Wallet, Category, Budget, Transaction
import '@/models/BudgetModel'
import '@/models/CategoryModel'
import '@/models/TransactionModel'
import '@/models/WalletModel'

// [DELETE]: /settings/delete-all
export async function DELETE(req: NextRequest) {
  console.log('- Delete All Data -')

  try {
    // connect to database
    await connectDatabase()

    const token = await getToken({ req })
    const userId = token?._id

    // check if user is logged in
    if (!userId) {
      return NextResponse.json({ message: 'Please login to continue' }, { status: 404 })
    }

    await Promise.all([
      // delete all transactions
      TransactionModel.deleteMany({
        user: userId,
        // delete all categories
      }),
      CategoryModel.deleteMany(
        { user: userId }
        // delete al budgets
      ),
      BudgetModel.deleteMany({ user: userId }),
      // delete all wallets
      WalletModel.deleteMany({ user: userId }),
    ])

    // initially create personal wallet
    await WalletModel.create({
      user: userId,
      name: 'Cash',
      icon: '⭐',
    })

    // return response
    return NextResponse.json({ message: 'All data deleted successfully' }, { status: 200 })
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 })
  }
}
