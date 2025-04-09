import { connectDatabase } from '@/config/database'
import { toUTC } from '@/lib/time'
import BudgetModel from '@/models/BudgetModel'
import CategoryModel from '@/models/CategoryModel'
import TransactionModel, { TransactionType } from '@/models/TransactionModel'
import WalletModel from '@/models/WalletModel'

// Models: Transaction, Category, Wallet, Budget
import '@/models/BudgetModel'
import '@/models/CategoryModel'
import '@/models/TransactionModel'
import '@/models/WalletModel'
import mongoose from 'mongoose'

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
  const filter: { [key: string]: any } = defaults.filter
  let sort: { [key: string]: any } = defaults.sort

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
        const searchFields = ['name', 'type']

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

      if (key === 'amount') {
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

      if (key === 'from') {
        filter.date = { ...filter.date, $gte: toUTC(values[0]) }
        continue
      }

      if (key === 'to') {
        filter.date = { ...filter.date, $lte: toUTC(values[0]) }
        continue
      }

      // Normal Cases ---------------------
      filter[key] = values.length === 1 ? values[0] : { $in: values }
    }
  }

  return { filter, sort, limit, skip }
}

// MARK: Delete Transaction
export const deleteTransaction = async (transactionId: string) => {
  try {
    // connect to database
    await connectDatabase()

    // delete transaction
    const transaction: any = await TransactionModel.findByIdAndDelete(transactionId).lean()

    // check if transaction not found
    if (!transaction) {
      throw new Error('Transaction not found')
    }

    await Promise.all([
      // update category amount of this transaction
      CategoryModel.findByIdAndUpdate(transaction.category, { $inc: { amount: -transaction.amount } }),
      // update wallet amount of this transaction
      WalletModel.findByIdAndUpdate(transaction.wallet, {
        $inc: { [transaction.type]: -transaction.amount },
      }),
      // update budgets
      BudgetModel.updateMany(
        {
          category: transaction.category,
          begin: { $lte: transaction.date },
          end: { $gte: transaction.date },
        },
        { $inc: { amount: -transaction.amount } }
      ),
    ])

    return { transaction: JSON.parse(JSON.stringify(transaction)), message: 'Deleted transaction' }
  } catch (err: any) {
    throw new Error(err)
  }
}

// MARK: Update Transaction
export const updateTransaction = async (
  transactionId: string,
  walletId: string,
  categoryId: string,
  name: string,
  amount: number,
  date: string
) => {
  try {
    // connect to database
    await connectDatabase()

    // 1. Get old transaction
    const oldTx = await TransactionModel.findById(transactionId)
    if (!oldTx) {
      throw new Error('Transaction not found')
    }

    // 2. Update transaction
    const newTx = await TransactionModel.findByIdAndUpdate(
      transactionId,
      { $set: { name, date: toUTC(date), amount, category: categoryId, wallet: walletId } },
      { new: true }
    ).populate('category wallet')

    // 3. Calculate amount delta
    const diff = amount - oldTx.amount

    // 4. Update related models
    await updateRelatedModels(oldTx, newTx, diff)

    return { transaction: JSON.parse(JSON.stringify(newTx)), message: 'Updated transaction' }
  } catch (err: any) {
    throw new Error(err)
  }
}

// MARK: Update Related Models
async function updateRelatedModels(oldTx: any, newTx: any, diff: number) {
  const session = await mongoose.startSession()
  session.startTransaction()

  try {
    await Promise.all([
      // update category
      updateCategory(oldTx, newTx, diff),
      // update wallet
      updateWallet(oldTx, newTx, diff),
      // update budgets
      updateBudget(oldTx, newTx, diff),
    ])

    await session.commitTransaction()
  } catch (error) {
    await session.abortTransaction()
    throw error
  } finally {
    session.endSession()
  }
}

// update category
async function updateCategory(oldTx: any, newTx: any, diff: number) {
  const oldCategoryId = oldTx.category
  const newCategoryId = newTx.category

  if (oldCategoryId.toString() === newCategoryId.toString()) {
    // if category not changed, update amount
    await CategoryModel.findByIdAndUpdate(oldCategoryId, {
      $inc: { amount: diff },
    })
  } else {
    // if category changed, decrease amount of old category and increase amount of new category
    await Promise.all([
      CategoryModel.findByIdAndUpdate(oldCategoryId, {
        $inc: { amount: -oldTx.amount },
      }),
      CategoryModel.findByIdAndUpdate(newCategoryId, {
        $inc: { amount: newTx.amount },
      }),
    ])
  }
}

// update wallet
async function updateWallet(oldTx: any, newTx: any, diff: number) {
  const oldWalletId = oldTx.wallet
  const newWalletId = newTx.wallet
  const transactionType = newTx.type

  if (oldWalletId.toString() === newWalletId.toString()) {
    // if wallet not changed, update amount
    await WalletModel.findByIdAndUpdate(oldWalletId, {
      $inc: { [transactionType]: diff },
    })
  } else {
    // if wallet changed, decrease amount of old wallet and increase amount of new wallet
    await Promise.all([
      WalletModel.findByIdAndUpdate(oldWalletId, {
        $inc: { [transactionType]: -oldTx.amount },
      }),
      WalletModel.findByIdAndUpdate(newWalletId, {
        $inc: { [transactionType]: newTx.amount },
      }),
    ])
  }
}

// update budget
async function updateBudget(oldTx: any, newTx: any, diff: number) {
  const oldCategoryId = oldTx.category
  const newCategoryId = newTx.category
  const oldTransactionDate = new Date(oldTx.date) // old date
  const newTransactionDate = new Date(newTx.date) // new date

  // find old and new budget
  const [oldBudget, newBudget] = await Promise.all([
    BudgetModel.findOne({
      category: oldCategoryId,
      begin: { $lte: oldTransactionDate },
      end: { $gte: oldTransactionDate },
    }),
    BudgetModel.findOne({
      category: newCategoryId,
      begin: { $lte: newTransactionDate },
      end: { $gte: newTransactionDate },
    }),
  ])

  if (
    (oldBudget && newBudget && oldBudget._id.toString() === newBudget._id.toString()) ||
    (!oldBudget && !newBudget)
  ) {
    // if budget not changed or not found, update amount
    if (oldBudget) {
      await BudgetModel.findByIdAndUpdate(oldBudget._id, {
        $inc: { amount: diff },
      })
    }
  } else {
    // if budget changed or only one exists, update both if needed
    const updates = []
    if (oldBudget) {
      updates.push(
        BudgetModel.findByIdAndUpdate(oldBudget._id, {
          $inc: { amount: -oldTx.amount }, // decrease amount of old budget
        })
      )
    }
    if (newBudget) {
      updates.push(
        BudgetModel.findByIdAndUpdate(newBudget._id, {
          $inc: { amount: newTx.amount }, // increase amount of new budget
        })
      )
    }
    if (updates.length > 0) {
      await Promise.all(updates)
    }
  }
}

// MARK: Create Transaction
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

// MARK: Get Transaction
export const getTransaction = async (transactionId: string) => {
  try {
    // connect to database
    await connectDatabase()

    // get transaction
    const transaction = await TransactionModel.findById(transactionId).populate('category wallet').lean()

    return { transaction: JSON.parse(JSON.stringify(transaction)), message: 'category is here' }
  } catch (err: any) {
    throw new Error(err)
  }
}

// MARK: Get History
export const getHistory = async (userId: string, params: any = {}) => {
  try {
    // connect to database
    await connectDatabase()

    const { from, to } = params

    // required date range
    if (!from || !to) {
      return { message: 'Please provide date range' }
    }

    const { filter, sort, skip, limit } = filterBuilder(params, {
      filter: { user: userId },
      sort: { date: -1, createdAt: -1 },
      skip: 0,
      limit: Infinity,
    })

    // get all transaction in time range
    const transactions = await TransactionModel.find(filter)
      .populate('category wallet')
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean()

    return { transactions: JSON.parse(JSON.stringify(transactions)), message: 'History is here' }
  } catch (err: any) {
    throw new Error(err.message)
  }
}

// MARK: Get Transactions
export const getTransactions = async (userId: string, params: any = {}) => {
  try {
    // connect to database
    await connectDatabase()

    console.log('params:', params)

    const { filter, sort, skip, limit } = filterBuilder(params, {
      filter: { user: userId },
      sort: { date: -1, createdAt: -1 },
      skip: 0,
      limit: Infinity,
    })

    console.log('filter:', filter)
    console.log('sort:', sort)
    console.log('skip:', skip)
    console.log('limit:', limit)

    // MARK: Overview
    const transactions = await TransactionModel.find(filter)
      .populate('wallet category')
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean()

    // const wallets = await WalletModel.find().lean()

    // wallets.forEach(async wallet => {
    //   const txs = await TransactionModel.find({ wallet: wallet._id }).lean()

    //   const income = txs
    //     .filter((tx: any) => tx.type === 'income')
    //     .reduce((acc: number, tx: any) => acc + tx.amount, 0)
    //   const expense = txs
    //     .filter((tx: any) => tx.type === 'expense')
    //     .reduce((acc: number, tx: any) => acc + tx.amount, 0)
    //   const balance = income - expense
    //   const invest = txs
    //     .filter((tx: any) => tx.type === 'invest')
    //     .reduce((acc: number, tx: any) => acc + tx.amount, 0)
    //   const saving = txs
    //     .filter((tx: any) => tx.type === 'saving')
    //     .reduce((acc: number, tx: any) => acc + tx.amount, 0)

    //   await WalletModel.findByIdAndUpdate(wallet._id, {
    //     $set: {
    //       balance,
    //       income,
    //       expense,
    //       invest,
    //       saving,
    //     },
    //   })
    // })

    // const categories = await CategoryModel.find().lean()

    // categories.forEach(async cate => {
    //   const txs = await TransactionModel.find({ category: cate._id }).lean()

    //   const total = txs.reduce((acc: number, tx: any) => acc + tx.amount, 0)

    //   await CategoryModel.findByIdAndUpdate(cate._id, {
    //     $set: {
    //       amount: total,
    //     },
    //   })
    // })

    return { transactions: JSON.parse(JSON.stringify(transactions)), message: 'Transactions are here' }
  } catch (err: any) {
    throw new Error(err)
  }
}
