import { connectDatabase } from '@/config/database'
import { initCategories } from '@/constants/categories'
import BudgetModel from '@/models/BudgetModel'
import CategoryModel from '@/models/CategoryModel'
import SettingsModel from '@/models/SettingsModel'
import TransactionModel from '@/models/TransactionModel'
import WalletModel from '@/models/WalletModel'

// Models: Wallet, Category, Budget, Transaction, Settings
import '@/models/BudgetModel'
import '@/models/CategoryModel'
import '@/models/SettingsModel'
import '@/models/TransactionModel'
import '@/models/WalletModel'

// MARK: Delete All Data
export const deleteAllData = async (userId: string) => {
  try {
    // connect to database
    await connectDatabase()

    await Promise.all([
      // delete all transactions
      TransactionModel.deleteMany({
        user: userId,
        // delete all categories
      }),
      CategoryModel.deleteMany({ user: userId }),
      BudgetModel.deleteMany({ user: userId }),
      // delete all wallets
      WalletModel.deleteMany({ user: userId }),
    ])

    const categories = Object.values(initCategories)
      .flat()
      .map(category => ({
        ...category,
        user: userId,
      }))

    await Promise.all([
      // initially create personal wallet
      WalletModel.create({
        user: userId,
        name: 'Cash',
        icon: '⭐',
      }),

      // Insert default categories
      CategoryModel.insertMany(categories),
    ])

    return { message: 'All data deleted successfully' }
  } catch (err: any) {
    throw new Error(err)
  }
}

// MARK: Update Settings
export const updateSettings = async (
  userId: string,
  {
    currency,
    language,
    personalities,
  }: {
    currency?: string
    language?: string
    personalities?: number[]
  }
) => {
  try {
    // connect to database
    await connectDatabase()

    const set: any = {}

    if (currency) set.currency = currency
    if (language) set.language = language
    if (personalities) set.personalities = personalities

    // update user settings
    let settings = await SettingsModel.findOneAndUpdate(
      { user: userId },
      { $set: set },
      { new: true }
    ).lean()

    return { settings: JSON.parse(JSON.stringify(settings)), message: 'Settings updated' }
  } catch (err: any) {
    throw new Error(err)
  }
}

// MARK: get settings
export const getSettings = async (userId: string) => {
  try {
    // connect to database
    await connectDatabase()

    // get user settings
    const settings = await SettingsModel.findOne({ user: userId }).lean()

    if (!settings) {
      throw new Error('Settings not found')
    }

    return { settings: JSON.parse(JSON.stringify(settings)), message: 'Settings are here' }
  } catch (err: any) {
    throw new Error(err)
  }
}
