import mongoose from 'mongoose'
import { IUser } from './UserModel'
const Schema = mongoose.Schema

const PushTokenSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'user',
      required: true,
    },
    token: {
      type: String,
      required: true,
      unique: true,
    },
    locale: {
      type: String,
      default: 'en',
    },
    deviceInfo: {
      brand: { type: String },
      modelName: { type: String },
      osName: { type: String },
      osVersion: { type: String },
    },
    lastUsedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
)

const PushTokenModel = mongoose.models.pushToken || mongoose.model('pushToken', PushTokenSchema)
export default PushTokenModel

export interface IDeviceInfo {
  brand: string
  modelName: string
  osName: string
  osVersion: string
}

export interface IPushToken {
  _id: string
  createdAt: string
  updatedAt: string

  user: string
  token: string
  locale: string
  deviceInfo?: IDeviceInfo
  lastUsedAt: Date
}

export type IFullPushToken = IPushToken & { user: IUser }
