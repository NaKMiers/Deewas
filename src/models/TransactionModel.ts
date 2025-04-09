import mongoose from 'mongoose'
import { ICategory } from './CategoryModel'
import { IUser } from './UserModel'
import { IWallet } from './WalletModel'
const Schema = mongoose.Schema

const TransactionSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'user',
      required: true,
    },
    wallet: {
      type: Schema.Types.ObjectId,
      ref: 'wallet',
      required: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'category',
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    type: {
      type: String,
      enum: ['income', 'expense', 'saving', 'invest'],
      required: true,
    },
  },
  { timestamps: true }
)

const TransactionModel = mongoose.models.transaction || mongoose.model('transaction', TransactionSchema)
export default TransactionModel

export interface ITransaction {
  _id: string
  createdAt: string
  updatedAt: string

  user: string
  wallet: string
  category: string
  type: TransactionType
  name: string
  amount: number
  date: string
}

export type TransactionType = 'income' | 'expense' | 'saving' | 'invest' | 'transfer' | 'balance'

export type IFullTransaction = ITransaction & { category: ICategory; wallet: IWallet; user: IUser }
