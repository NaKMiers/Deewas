import mongoose from 'mongoose'
import { IUser } from './UserModel'
const Schema = mongoose.Schema

const ReferralCodeSchema = new Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      maxlength: 10,
      minlength: 5,
    },
    desc: {
      type: String,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'user',
      required: true,
    },
    usedUsers: [
      {
        type: Schema.Types.ObjectId,
        required: true,
      },
    ],
    active: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
)

const ReferralCodeModel =
  mongoose.models.referralCode || mongoose.model('referralCode', ReferralCodeSchema)
export default ReferralCodeModel

export interface IReferralCode {
  _id: string
  createdAt: string
  updatedAt: string

  code: string
  desc: string
  owner: string | IUser
  usedUsers: string[]
  active: boolean
}
