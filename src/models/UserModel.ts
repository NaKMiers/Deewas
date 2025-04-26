import bcrypt from 'bcrypt'
import mongoose from 'mongoose'

const Schema = mongoose.Schema

const UserSchema = new Schema(
  {
    username: {
      type: String,
      required: function (this: { authType: string }) {
        return this.authType === 'local'
      },
      unique: function (this: { authType: string }) {
        return this.authType === 'local'
      },
      default: function (this: { authType: string; email: string }) {
        return this.authType !== 'local' ? `${this.email.split('@')[0]}` : ''
      },
    },
    email: {
      type: String,
      required: true,
      unique: true,
      validate: {
        validator: function (value: string) {
          return /^[\w-\.]+@([\w-]+\.)+[\w-]{2,8}$$/.test(value)
        },
        message: 'Email không hợp lệ',
      },
    },
    password: {
      type: String,
      required: function (this: { authType: string }) {
        return this.authType === 'local'
      },
      validate: {
        validator: function (value: string) {
          return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/.test(value)
        },
        message: 'Mật khẩu không hợp lệ',
      },
    },
    googleUserId: {
      type: String,
      required: function (this: { authType: string }) {
        return this.authType === 'google'
      },
      unique: function (this: { authType: string }) {
        return this.authType === 'google'
      },
    },
    appleUserId: {
      type: String,
      required: function (this: { authType: string }) {
        return this.authType === 'apple'
      },
      unique: function (this: { authType: string }) {
        return this.authType === 'apple'
      },
    },
    authType: {
      type: String,
      enum: ['local', 'google', 'facebook', 'apple'],
      default: 'local',
    },
    role: {
      type: String,
      enum: ['admin', 'user'],
      default: 'user',
    },
    avatar: {
      type: String,
      default: process.env.NEXT_PUBLIC_DEFAULT_AVATAR,
    },
    firstName: {
      type: String,
      default: '',
    },
    lastName: {
      type: String,
      default: '',
    },
    initiated: {
      type: Boolean,
      default: false,
    },

    // plan:
    plan: {
      type: String,
      enum: [
        'free',
        'trial-7',
        'trial-14',
        'trial-30',
        'premium-1m',
        'premium-3m',
        'premium-12m',
        'premium-lt',
      ],
      default: 'free',
    },
    planExpiredAt: {
      type: Date,
    },
    paymentMethod: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
)

UserSchema.pre('save', async function (next) {
  console.log('- Pre Save User -')
  // check authType before saving
  if (this.authType !== 'local' || !this.isModified('password')) {
    return next()
  }

  // hash password before saving
  try {
    const hashedPassword = await bcrypt.hash(this.password || '', +process.env.BCRYPT_SALT_ROUND! || 10)
    this.password = hashedPassword

    next()
  } catch (err: any) {
    return next(err)
  }
})

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
  firstName: string
  lastName: string
  initiated: boolean

  plan: string
  planExpiredAt: Date
  paymentMethod: string
}

export type TAuthType = 'local' | 'google' | 'facebook' | 'apple'
export type TUserRole = 'admin' | 'user'
