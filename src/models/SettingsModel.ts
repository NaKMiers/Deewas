import { update_category } from './../lib/tools/categoryTools'
import mongoose from 'mongoose'
import { IUser } from './UserModel'
const Schema = mongoose.Schema

const SettingsSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'user',
      required: true,
      unique: true, // each user has only one settings
    },
    personalities: {
      type: [Number], // index of personalities
      default: [0],
    },
    currency: {
      type: String,
      default: 'USD',
    },
    language: {
      type: String,
      default: 'en',
    },
    freeTokensUsed: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
)

const SettingsModel = mongoose.models.settings || mongoose.model('settings', SettingsSchema)
export default SettingsModel

export interface ISettings {
  _id: string
  createdAt: string
  updatedAt: string

  user: string
  personalities: number[]
  currency: string
  language: string

  freeTokensUsed: number
}

export type IFullSettings = ISettings & { user: IUser }
