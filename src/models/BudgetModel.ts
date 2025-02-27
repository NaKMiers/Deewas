import mongoose from 'mongoose'
import { ICategory } from './CategoryModel'
import { IUser } from './UserModel'
import { IWallet } from './WalletModel'
const Schema = mongoose.Schema

const BudgetSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'user',
      index: true,
    },
    wallet: {
      type: Schema.Types.ObjectId,
      ref: 'wallet',
      required: true,
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: 'category',
      required: true,
    },

    total: {
      type: Number,
      required: true,
    },
    begin: {
      type: Date,
      required: true,
    },
    end: {
      type: Date,
      required: true,
    },
    deleted: {
      type: Boolean,
      default: false,
    },

    // sync with transaction
    amount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
)

// category-begin-end unique
BudgetSchema.index({ category: 1, begin: 1, end: 1 }, { unique: true })

const BudgetModel = mongoose.models.budget || mongoose.model('budget', BudgetSchema)
export default BudgetModel

export interface IBudget {
  _id: string
  createdAt: string
  updatedAt: string

  user: string
  wallet: string
  category: string

  total: number
  begin: string
  end: string

  amount: number
}

export type IFullBudget = IBudget & { user: IUser; wallet: IWallet; category: ICategory }
