import mongoose from 'mongoose'
import { TransactionType } from './TransactionModel'
import { IUser } from './UserModel'
const Schema = mongoose.Schema

const WalletSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'user',
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    icon: {
      type: String,
    },
    deleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
)

const WalletModel = mongoose.models.wallet || mongoose.model('wallet', WalletSchema)
export default WalletModel

export interface IWallet {
  _id: string
  createdAt: string
  updatedAt: string

  name: string
  user: string
  icon: string
  type: TransactionType
  delete: boolean
}

export type IFullWallet = IWallet & {
  user: IUser
  balance: number
  income: number
  expense: number
  saving: number
  invest: number
}
