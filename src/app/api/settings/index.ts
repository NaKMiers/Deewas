import { connectDatabase } from '@/config/database'
import { getMessagesByLocale, initCategories } from '@/constants/categories'
import BudgetModel from '@/models/BudgetModel'
import CategoryModel from '@/models/CategoryModel'
import SettingsModel from '@/models/SettingsModel'
import TransactionModel from '@/models/TransactionModel'
import WalletModel from '@/models/WalletModel'
import { createTranslator } from 'next-intl'

// Models: Wallet, Category, Budget, Transaction, Settings
import '@/models/BudgetModel'
import '@/models/CategoryModel'
import '@/models/SettingsModel'
import '@/models/TransactionModel'
import '@/models/WalletModel'

// MARK: Delete All Data
export const deleteAllData = async (userId: string, locale: string) => {
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

    // MARK: Create new user and init data
    const messages = getMessagesByLocale(locale)
    const t = createTranslator({ locale, messages, namespace: 'categories' })

    let translatedCategories: any = {}
    for (const type in initCategories) {
      const categories = (initCategories as any)[type].map((cate: any) => ({
        ...cate,
        name: t(cate.name),
      }))
      translatedCategories[type] = categories
    }

    const categories = Object.values(translatedCategories)
      .flat()
      .map((category: any) => ({
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
    throw err
  }
}

// MARK: Update Settings
export const updateSettings = async (
  userId: string,
  {
    currency,
    language,
    personalities,
    firstLaunch,
  }: {
    currency?: string
    language?: string
    personalities?: number[]
    firstLaunch?: boolean
  }
) => {
  try {
    // connect to database
    await connectDatabase()

    const set: any = {}

    if (currency !== undefined) set.currency = currency
    if (language !== undefined) set.language = language
    if (personalities !== undefined) set.personalities = personalities
    if (firstLaunch !== undefined) set.firstLaunch = firstLaunch

    // update user settings
    let settings = await SettingsModel.findOneAndUpdate(
      { user: userId },
      { $set: set },
      { new: true }
    ).lean()

    return { settings: JSON.parse(JSON.stringify(settings)), message: 'Settings updated' }
  } catch (err: any) {
    throw err
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
      throw { errorCode: 'SETTINGS_NOT_FOUND', message: 'Settings not found' }
    }

    return { settings: JSON.parse(JSON.stringify(settings)), message: 'Settings are here' }
  } catch (err: any) {
    throw err
  }
}
