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
      min: 0,
    },
    begin: {
      type: Date,
      required: true,
      validate: {
        validator: function (this: { end: Date | string }, value: Date) {
          return this.end ? value < this.end : true
        },
        message: 'Begin date must be before End date',
      },
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
      min: 0,
    },
  },
  { timestamps: true }
)

// indexed
BudgetSchema.index({ user: 1 })
BudgetSchema.index({ wallet: 1 })
BudgetSchema.index({ category: 1 })

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
