import mongoose from 'mongoose'
import { TransactionType } from './TransactionModel'
import { IUser } from './UserModel'
import { IWallet } from './WalletModel'
const Schema = mongoose.Schema

const CategorySchema = new Schema(
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
    name: {
      type: String,
      required: true,
    },
    icon: {
      type: String,
    },
    type: {
      type: String,
      enum: ['income', 'expense', 'saving', 'invest'],
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

// indexed
CategorySchema.index({ user: 1 })
CategorySchema.index({ wallet: 1 })

const CategoryModel = mongoose.models.category || mongoose.model('category', CategorySchema)
export default CategoryModel

export interface ICategory {
  _id: string
  createdAt: string
  updatedAt: string

  wallet: string
  name: string
  user: string
  icon: string
  type: TransactionType
  deleted: boolean

  amount: number
}

export type IFullCategory = ICategory & { user: IUser; wallet: IWallet }
