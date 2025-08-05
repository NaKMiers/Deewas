import { connectDatabase } from '@/config/database'
import { toUTC } from '@/lib/time'
import CategoryModel from '@/models/CategoryModel'
import TransactionModel, { IFullTransaction } from '@/models/TransactionModel'
import WalletModel from '@/models/WalletModel'

// Models: Wallet, Transaction, Category, Budget
import '@/models/BudgetModel'
import BudgetModel from '@/models/BudgetModel'
import '@/models/CategoryModel'
import '@/models/TransactionModel'
import '@/models/WalletModel'

type DefaultsType = {
  skip: number
  limit: number
  filter: { [key: string]: any }
  sort: { [key: string]: any }
}

// MARK: Filter Builder
const filterBuilder = (
  params: any,
  defaults: DefaultsType = {
    skip: 0,
    limit: Infinity,
    sort: {},
    filter: {},
  }
) => {
  // options
  let skip = defaults.skip
  let limit = defaults.limit
  const filter: { [key: string]: any } = { ...defaults.filter }
  let sort: { [key: string]: any } = { ...defaults.sort }

  // build filter
  for (const key in params) {
    const values = params[key]

    if (params.hasOwnProperty(key)) {
      // Special Cases ---------------------
      if (key === 'limit') {
        limit = +values[0]
        continue
      }

      if (key === 'page') {
        // page only works when limit is set
        if (limit === Infinity) {
          continue
        }

        const page = +values[0]
        skip = (page - 1) * limit
        continue
      }

      if (key === 'search') {
        const searchFields = ['name', 'icon']

        filter.$or = searchFields.map(field => ({
          [field]: { $regex: values[0], $options: 'i' },
        }))
        continue
      }

      if (key === 'sort') {
        values.forEach((value: string) => {
          sort[value.split('|')[0]] = +value.split('|')[1]
        })

        continue
      }

      if (['income', 'expense', 'saving', 'invest', 'transfer'].includes(key)) {
        const from = +values[0].split('-')[0]
        const to = +values[0].split('-')[1]
        if (from >= 0 && to >= 0) {
          filter[key] = {
            $gte: from,
            $lte: to,
          }
        } else if (from >= 0) {
          filter[key] = {
            $gte: from,
          }
        } else if (to >= 0) {
          filter[key] = {
            $lte: to,
          }
        }
        continue
      }

      // Normal Cases ---------------------
      filter[key] = values.length === 1 ? values[0] : { $in: values }
    }
  }

  return { filter, sort, limit, skip }
}

// MARK: Delete Wallet
export const deleteWallet = async (userId: string, walletId: string) => {
  try {
    // connect to database
    await connectDatabase()

    const [walletCount, transactionsOfWallet]: any[] = await Promise.all([
      // count wallets
      WalletModel.countDocuments({ user: userId }).lean(),
      TransactionModel.find({ wallet: walletId })
        .populate({
          path: 'category',
          select: '_id',
        })
        .select('_id category amount')
        .lean(),
    ])

    // make unique category ids from transactions
    const categoryIds: any[] = [
      ...new Set(transactionsOfWallet.map((t: IFullTransaction) => t.category._id)),
    ]

    const promises = categoryIds.map((cateId: string) => {
      const totalAmountOfTxOfCate = transactionsOfWallet
        .filter((t: IFullTransaction) => t.category._id.toString() === cateId.toString())
        .reduce((total: number, tx: IFullTransaction) => total + tx.amount, 0)
      return CategoryModel.findByIdAndUpdate(cateId, { $inc: { amount: -totalAmountOfTxOfCate } })
    })

    // delete all transactions associated with wallet
    promises.push(TransactionModel.deleteMany({ wallet: walletId }))

    // clear wallet if only one wallet is left
    if (walletCount > 1) {
      // delete wallet
      promises.unshift(WalletModel.findByIdAndDelete(walletId))
    } else {
      promises.unshift(
        WalletModel.findByIdAndUpdate(
          walletId,
          { $set: { income: 0, expense: 0, saving: 0, invest: 0 } },
          { new: true }
        )
      )
    }

    // implement all promises
    const [wallet] = await Promise.all(promises)

    return {
      wallet: JSON.parse(JSON.stringify(wallet)),
      message: walletCount > 1 ? 'Deleted wallet' : 'Cleared wallet',
    }
  } catch (err: any) {
    throw err
  }
}

// MARK: Update Wallet
export const updateWallet = async (walletId: string, name: string, icon: string, exclude: string) => {
  // connect to database
  await connectDatabase()

  // update wallet
  const wallet = await WalletModel.findByIdAndUpdate(
    walletId,
    { $set: { name: name.trim(), icon, exclude } },
    { new: true }
  ).lean()

  return { wallet: JSON.parse(JSON.stringify(wallet)), message: 'Updated wallet' }
}

// MARK: Create Wallet
export const createWallet = async (userId: string, isPremium: boolean, name: string, icon: string) => {
  try {
    // connect to database
    await connectDatabase()

    // limit 2 wallets for free user
    if (!isPremium) {
      // count user wallets
      const walletCount = await WalletModel.countDocuments({ user: userId }).lean()

      if (walletCount >= 2) {
        throw {
          errorCode: 'WALLET_LIMIT_REACHED',
          message: 'Wallet limit reached, please upgrade to Premium to create more wallets',
        }
      }
    }

    // create wallet
    const wallet = await WalletModel.create({
      user: userId,
      name: name.trim(),
      icon,
    })

    return { wallet: JSON.parse(JSON.stringify(wallet)), message: 'Created wallet' }
  } catch (err: any) {
    throw err
  }
}

// MARK: Transfer Wallet
export const transfer = async (
  userId: string,
  fromWalletId: string,
  toWalletId: string,
  amount: number,
  date: string
) => {
  try {
    // connect to database
    await connectDatabase()

    const [fromWallet, toWallet, unCategorizedIncomeCate, unCategorizedExpenseCate] = await Promise.all([
      WalletModel.findById(fromWalletId).select('name'),
      WalletModel.findById(toWalletId).select('name'),
      CategoryModel.findOne({ user: userId, deletable: false, type: 'income' }).select('_id'),
      CategoryModel.findOne({ user: userId, deletable: false, type: 'expense' }).select('_id'),
    ])

    if (!fromWallet) {
      throw { errorCode: 'WALLET_NOT_FOUND', message: 'Source wallet not found' }
    }

    if (!toWallet) {
      throw { errorCode: 'WALLET_NOT_FOUND', message: 'Destination wallet not found' }
    }

    if (!unCategorizedIncomeCate || !unCategorizedExpenseCate) {
      throw { errorCode: 'CATEGORY_NOT_FOUND', message: 'Uncategorized category not found' }
    }

    const [sourceW, destinationW] = await Promise.all([
      // increase source wallet expense
      WalletModel.findByIdAndUpdate(fromWalletId, { $inc: { expense: amount } }, { new: true }),

      // increase destination wallet income
      WalletModel.findByIdAndUpdate(toWalletId, { $inc: { income: amount } }, { new: true }),

      // create transfer transactions
      TransactionModel.create({
        user: userId,
        wallet: fromWalletId,
        category: unCategorizedExpenseCate._id,
        type: 'expense',
        name: `${fromWallet.name} ➡️ ${toWallet.name}`,
        amount: amount,
        date: toUTC(date),
        exclude: true,
      }),

      // create transfer transactions
      TransactionModel.create({
        user: userId,
        wallet: toWalletId,
        category: unCategorizedIncomeCate._id,
        type: 'income',
        name: `${toWallet.name} ⬅️ ${fromWallet.name}`,
        amount: amount,
        date: toUTC(date),
        exclude: true,
      }),

      // increase uncategorized expense category amount
      CategoryModel.findByIdAndUpdate(unCategorizedExpenseCate._id, { $inc: { amount: amount } }),

      // increase uncategorized income category amount
      CategoryModel.findByIdAndUpdate(unCategorizedIncomeCate._id, { $inc: { amount: amount } }),

      // increase amount of all budgets of uncategorized expense category
      BudgetModel.updateMany(
        {
          category: unCategorizedExpenseCate._id,
          begin: { $lte: toUTC(date) },
          end: { $gte: toUTC(date) },
        },
        { $inc: { amount: amount } }
      ),
    ])

    return {
      sourceWallet: JSON.parse(JSON.stringify(sourceW)),
      destinationWallet: JSON.parse(JSON.stringify(destinationW)),
      message: 'Funds transferred',
    }
  } catch (err: any) {
    throw err
  }
}

// MARK: Get Wallet
export const getWallet = async (walletId: string, userId: string) => {
  try {
    // connect to database
    await connectDatabase()

    // find wallet
    const wallet = await WalletModel.findById(walletId).lean()
    const categories = await CategoryModel.find({ wallet: walletId, user: userId }).lean()

    // check if wallet exist
    if (!wallet) {
      throw { errorCode: 'WALLET_NOT_FOUND', message: 'Wallet not found' }
    }

    return {
      wallet: JSON.parse(JSON.stringify(wallet)),
      categories: JSON.parse(JSON.stringify(categories)),
      message: 'Wallet is here',
    }
  } catch (err: any) {
    throw err
  }
}

// MARK: Get Wallets
export const getWallets = async (userId: string, params: any = {}) => {
  try {
    // connect to database
    await connectDatabase()

    const { filter, sort, limit, skip } = filterBuilder(params, {
      skip: 0,
      limit: Infinity,
      sort: { updatedAt: -1 },
      filter: { user: userId },
    })

    // get user wallets
    const wallets = await WalletModel.find(filter).sort(sort).skip(skip).limit(limit).lean()

    return { wallets: JSON.parse(JSON.stringify(wallets)), message: 'Wallets are here' }
  } catch (err: any) {
    throw err
  }
}
