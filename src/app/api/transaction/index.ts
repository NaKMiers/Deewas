import { connectDatabase } from '@/config/database'
import BudgetModel from '@/models/BudgetModel'
import CategoryModel from '@/models/CategoryModel'
import TransactionModel, { TransactionType } from '@/models/TransactionModel'
import WalletModel from '@/models/WalletModel'

// Models: Transaction, Category, Wallet, Budget
import { toUTC } from '@/lib/time'
import '@/models/BudgetModel'
import '@/models/CategoryModel'
import '@/models/TransactionModel'
import '@/models/WalletModel'

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

    console.log('Transaction:', transaction)

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

export const updateTransaction = async (
  transactionId: string,
  walletId: string,
  name: string,
  amount: number,
  date: string
) => {
  try {
    // connect to database
    await connectDatabase()

    console.log('updateTransaction', transactionId, walletId, name, amount, date)

    // update transaction
    const oldTx: any = await TransactionModel.findByIdAndUpdate(
      transactionId,
      { $set: { wallet: walletId, name, amount, date: toUTC(date) } },
      { new: false } // return old document
    ).lean()

    // check if transaction not found
    if (!oldTx) {
      throw new Error('Transaction not found')
    }

    const promises: any[] = [
      // get new updated transaction
      TransactionModel.findById(transactionId).populate('category wallet').lean(),
    ]

    // amount is changed
    if (oldTx.amount !== amount) {
      const diffAmount = amount - oldTx.amount

      // update category amount of this transaction
      promises.push(CategoryModel.findByIdAndUpdate(oldTx.category, { $inc: { amount: diffAmount } }))

      // update budgets
      promises.push(
        BudgetModel.updateMany(
          {
            category: oldTx.category,
            begin: { $lte: oldTx.date },
            end: { $gte: oldTx.date },
          },
          { $inc: { amount: diffAmount } }
        )
      )

      if (walletId !== oldTx.wallet.toString()) {
        // update "old" wallet amount of this transaction
        promises.push(
          WalletModel.findByIdAndUpdate(oldTx.wallet, { $inc: { [oldTx.type]: -oldTx.amount } })
        )
        // update "new" wallet amount of this transaction
        promises.push(WalletModel.findByIdAndUpdate(walletId, { $inc: { [oldTx.type]: amount } }))
      } else {
        // update "old" wallet amount of this transaction
        promises.push(
          WalletModel.findByIdAndUpdate(oldTx.wallet, { $inc: { [oldTx.type]: diffAmount } })
        )
      }
    }
    // wallet is changed
    else if (walletId !== oldTx.wallet.toString()) {
      // update "old" wallet amount of this transaction
      promises.push(
        WalletModel.findByIdAndUpdate(oldTx.wallet, { $inc: { [oldTx.type]: -oldTx.amount } })
      )
      // update "new" wallet amount of this transaction
      promises.push(WalletModel.findByIdAndUpdate(walletId, { $inc: { [oldTx.type]: amount } }))
    }

    const [transaction] = await Promise.all(promises)

    // check if transaction not found
    if (!transaction) {
      throw new Error('Transaction not found')
    }

    return { transaction: JSON.parse(JSON.stringify(transaction)), message: 'Updated transaction' }
  } catch (err: any) {
    throw new Error(err)
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

export const getHistory = async (userId: string, params: any = {}) => {
  try {
    // connect to database
    await connectDatabase()

    const { from, to } = params

    // required date range
    if (!from || !to) {
      return { message: 'Please provide date range' }
    }

    // get all transaction in time range
    const transactions = await TransactionModel.find({
      user: userId,
      date: { $gte: toUTC(from), $lte: toUTC(to) },
    })
      .populate('category wallet')
      .sort({ date: -1 })
      .lean()

    return { transactions: JSON.parse(JSON.stringify(transactions)), message: 'Home is here' }
  } catch (err: any) {
    throw new Error(err.message)
  }
}

export const getTransactions = async (userId: string, params: any = {}) => {
  try {
    // connect to database
    await connectDatabase()

    const { walletId, from, to, type, amount, name } = params

    console.log('Params:', params)

    const sort = params.sort || 'date'
    const orderBy = parseInt(params.orderBy || '-1', 10) as 1 | -1
    const limit = params.limit || Infinity

    const filter: any = { user: userId }
    if (walletId) filter.wallet = walletId
    if (from) filter.date = { $gte: toUTC(from) }
    if (to) filter.date = { ...filter.date, $lte: toUTC(to) }
    if (type) filter.type = type
    if (amount) filter.amount = amount
    if (name) filter.name = { $regex: name, $options: 'i' }

    // MARK: Overview
    const transactions = await TransactionModel.find(filter)
      .populate('wallet category')
      .sort({ [sort]: orderBy })
      .limit(+limit)
      .lean()

    return { transactions: JSON.parse(JSON.stringify(transactions)), message: 'Transactions are here' }
  } catch (err: any) {
    throw new Error(err)
  }
}
