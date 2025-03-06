import { connectDatabase } from '@/config/database'
import CategoryModel from '@/models/CategoryModel'
import TransactionModel from '@/models/TransactionModel'
import WalletModel from '@/models/WalletModel'

// Models: Wallet, Transaction, Category, Budget
import { toUTC } from '@/lib/time'
import '@/models/BudgetModel'
import '@/models/CategoryModel'
import '@/models/TransactionModel'
import '@/models/WalletModel'

export const deleteWallet = async (userId: string, walletId: string) => {
  try {
    // connect to database
    await connectDatabase()

    const [walletCount]: any[] = await Promise.all([
      // count wallets
      WalletModel.countDocuments({ user: userId }).lean(),
      // delete all transactions associated with wallet
      TransactionModel.deleteMany({ wallet: walletId }),
    ])

    // clear wallet if only one wallet is left
    if (walletCount > 1) {
      // delete wallet
      const wallet = await WalletModel.findByIdAndDelete(walletId)
      return { wallet, message: 'Deleted wallet' }
    } else {
      const wallet = await WalletModel.findByIdAndUpdate(
        walletId,
        { $set: { income: 0, expense: 0, saving: 0, invest: 0 } },
        { new: true }
      )
      return { wallet: JSON.parse(JSON.stringify(wallet)), message: 'Cleared wallet' }
    }
  } catch (err: any) {
    throw new Error(err)
  }
}

export const updateWallet = async (walletId: string, name: string, icon: string, hide: string) => {
  // connect to database
  await connectDatabase()

  // update wallet
  const wallet = await WalletModel.findByIdAndUpdate(
    walletId,
    { $set: { name, icon, hide } },
    { new: true }
  ).lean()

  return { wallet: JSON.parse(JSON.stringify(wallet)), message: 'Updated wallet' }
}

export const getWallet = async (walletId: string, userId: string) => {
  try {
    // connect to database
    await connectDatabase()

    // find wallet
    const wallet = await WalletModel.findById(walletId).lean()
    const categories = await CategoryModel.find({ wallet: walletId, user: userId }).lean()

    // check if wallet exist
    if (!wallet) {
      throw new Error('Wallet not found')
    }

    return {
      wallet: JSON.parse(JSON.stringify(wallet)),
      categories: JSON.parse(JSON.stringify(categories)),
      message: 'Wallet is here',
    }
  } catch (err: any) {
    throw new Error(err)
  }
}

export const createWallet = async (userId: string, name: string, icon: string) => {
  try {
    // connect to database
    await connectDatabase()

    // create wallet
    const wallet = await WalletModel.create({
      user: userId,
      name,
      icon,
    })

    return { wallet: JSON.parse(JSON.stringify(wallet)), message: 'Created wallet' }
  } catch (err: any) {
    throw new Error(err)
  }
}

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

    const [fromWallet, toWallet, transferCategory] = await Promise.all([
      WalletModel.findById(fromWalletId).select('name'),
      WalletModel.findById(toWalletId).select('name'),
      CategoryModel.findOne({ deletable: false, type: 'transfer' }).select('_id'),
    ])

    if (!fromWallet) {
      throw new Error('Source wallet not found')
    }

    if (!toWallet) {
      throw new Error('Destination wallet not found')
    }

    if (!transferCategory) {
      throw new Error('Cannot categorized this action')
    }

    const [sourceW, destinationW] = await Promise.all([
      // update from wallet
      WalletModel.findByIdAndUpdate(fromWalletId, { $inc: { transfer: -amount } }, { new: true }),

      // update to wallet
      WalletModel.findByIdAndUpdate(toWalletId, { $inc: { transfer: amount } }, { new: true }),

      // create transfer transactions
      TransactionModel.create({
        user: userId,
        wallet: fromWalletId,
        category: transferCategory._id,
        type: 'transfer',
        name: `Transferred from ${fromWallet.name} to ${toWallet.name}`,
        amount: -amount,
        date: toUTC(date),
      }),

      // create transfer transactions
      TransactionModel.create({
        user: userId,
        wallet: toWalletId,
        category: transferCategory._id,
        type: 'transfer',
        name: `Transferred from ${fromWallet.name} to ${toWallet.name}`,
        amount: amount,
        date: toUTC(date),
      }),
    ])

    return {
      sourceWallet: JSON.parse(JSON.stringify(sourceW)),
      destinationWallet: JSON.parse(JSON.stringify(destinationW)),
      message: 'Funds transferred',
    }
  } catch (err: any) {
    throw new Error(err)
  }
}

export const getWallets = async (userId: string) => {
  try {
    // connect to database
    await connectDatabase()

    // get user wallets
    const wallets = await WalletModel.find({ user: userId }).lean()

    return { wallets: JSON.parse(JSON.stringify(wallets)), message: 'Wallets are here' }
  } catch (err: any) {
    throw new Error(err)
  }
}
