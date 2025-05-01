import mongoose from 'mongoose'

const Schema = mongoose.Schema

const UserSchema = new Schema(
  {
    username: {
      type: String,
      required: function (this: { authType: string }) {
        return this.authType === 'local'
      },
      unique: true,
      sparse: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: function (this: { authType: string }) {
        return this.authType === 'local'
      },
    },
    googleUserId: {
      type: String,
      required: function (this: { authType: string }) {
        return this.authType === 'google'
      },
      unique: true,
      sparse: true,
    },
    appleUserId: {
      type: String,
      required: function (this: { authType: string }) {
        return this.authType === 'apple'
      },
      unique: true,
      sparse: true,
    },
    authType: {
      type: String,
      enum: ['local', 'google', 'facebook', 'apple'],
      default: 'local',
    },
    role: {
      type: String,
      enum: ['admin', 'user', 'collaborator'],
      default: 'user',
    },
    avatar: String,
    name: String,
    initiated: {
      type: Boolean,
      default: false,
    },

    // plan:
    plan: {
      type: String,
      enum: ['free', 'premium-monthly', 'premium-yearly', 'premium-lifetime'],
      default: 'free',
    },
    planExpiredAt: Date,
    purchasedAtPlatform: String,
  },
  {
    timestamps: true,
  }
)

const UserModel = mongoose.models.user || mongoose.model('user', UserSchema)
export default UserModel

export interface IUser {
  _id: string
  createdAt: string
  updatedAt: string

  username: string
  email: string
  password: string
  authType: TAuthType
  role: TUserRole
  appleUserId: string
  googleUserId: string

  avatar: string
  name: string
  initiated: boolean

  plan: string
  planExpiredAt: Date | null
  purchasedAtPlatform: string
}

export type TAuthType = 'local' | 'google' | 'facebook' | 'apple'
export type TUserRole = 'admin' | 'user'
