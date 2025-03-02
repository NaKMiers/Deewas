import mongoose from 'mongoose'
import { TransactionType } from './TransactionModel'
import { IUser } from './UserModel'
const Schema = mongoose.Schema

const CategorySchema = new Schema(
  {
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
    deletable: {
      type: Boolean,
      default: true,
    },

    // sync with transaction
    amount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
)

CategorySchema.index({ user: 1, name: 1, type: 1 }, { unique: true })
CategorySchema.index({ user: 1, type: 1, deletable: 1 }, { unique: true })

const CategoryModel = mongoose.models.category || mongoose.model('category', CategorySchema)
export default CategoryModel

export interface ICategory {
  _id: string
  createdAt: string
  updatedAt: string

  name: string
  user: string
  icon: string
  type: TransactionType
  amount: number
  deletable: boolean
}

export type IFullCategory = ICategory & { user: IUser }
