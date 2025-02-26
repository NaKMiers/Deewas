import mongoose from 'mongoose'
import { TransactionType } from './TransactionModel'
import { IUser } from './UserModel'
import { IWallet } from './WalletModel'
const Schema = mongoose.Schema

const CategorySchema = new Schema(
  {
    wallet: {
      type: Schema.Types.ObjectId,
      ref: 'wallet',
      required: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'user',
      index: true,
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
  },
  { timestamps: true }
)

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
}

export type IFullCategory = ICategory & { user: IUser; wallet: IWallet }
