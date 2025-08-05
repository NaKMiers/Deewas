import { connectDatabase } from '@/config/database'
import { getMessagesByLocale, initCategories } from '@/constants/categories'
import CategoryModel from '@/models/CategoryModel'
import SettingsModel from '@/models/SettingsModel'
import UserModel from '@/models/UserModel'
import WalletModel from '@/models/WalletModel'
import { OAuth2Client } from 'google-auth-library'
import { sign } from 'jsonwebtoken'
import { createTranslator } from 'next-intl'
import { NextRequest, NextResponse } from 'next/server'

// Models: Wallet, Category, Settings, User
import '@/models/CategoryModel'
import '@/models/SettingsModel'
import '@/models/UserModel'
import '@/models/WalletModel'
import moment from 'moment-timezone'

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)

// [POST]: /auth/sign-in/google
export async function POST(req: NextRequest) {
  console.log('- Sign In With Google -')

  try {
    // get data from request body
    let { idToken, googleUserId, locale } = await req.json()
    locale = locale || 'en'
    const timezone = req.headers.get('x-timezone') || 'UTC'

    // check if idToken is exist
    if (!idToken || !googleUserId) {
      return NextResponse.json({ message: 'ID is required' }, { status: 400 })
    }

    // verify id token
    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    })

    // check if ticket is valid
    if (!ticket) {
      return NextResponse.json({ message: 'Invalid ID token' }, { status: 401 })
    }

    // get payload from ticket
    const payload: any = ticket.getPayload()

    // check if payload is valid
    if (!payload && !payload?.email) {
      return NextResponse.json({ message: 'Invalid ID token' }, { status: 401 })
    }

    // Verify userId matches sub
    if (payload.sub !== googleUserId) {
      return NextResponse.json({ message: 'User ID mismatch' }, { status: 401 })
    }

    // get data from payload
    const { email, name, picture: avatar } = payload

    // connect to database
    await connectDatabase()

    // find user from database
    let user: any = await UserModel.findOneAndUpdate(
      { email },
      { $set: { avatar, authType: 'google', timezone } },
      { new: true }
    ).lean()

    let isNewUser = false

    // check if user exists
    if (!user) {
      // create new user
      const newUser = await UserModel.create({
        email,
        name,
        avatar,
        authType: 'google',
        googleUserId,
        timezone,

        // MARK: Default plan ---
        plan: 'premium-monthly',
        planExpiredAt: moment().add(7, 'day').toDate(),
      })
      user = newUser._doc

      isNewUser = true

      // MARK: Create new user and init data
      const messages = getMessagesByLocale(locale)
      const tC = createTranslator({ locale, messages, namespace: 'categories' })
      const tW = createTranslator({ locale, messages, namespace: 'initWallet' })

      let translatedCategories: any = {}
      for (const type in initCategories) {
        const categories = (initCategories as any)[type].map((cate: any) => ({
          ...cate,
          name: tC(cate.name),
        }))
        translatedCategories[type] = categories
      }

      const translatedWallet: any = {
        user: newUser._id,
        name: tW('Cash'),
        icon: '⭐',
      }
      const categories = Object.values(translatedCategories)
        .flat()
        .map((category: any) => ({
          ...category,
          user: newUser._id,
        }))

      // Insert default categories
      await CategoryModel.insertMany(categories)

      await Promise.all([
        // create initial wallet
        WalletModel.create(translatedWallet),
        // initially create settings
        SettingsModel.create({
          user: newUser._id,
        }),
      ])
    }

    // check user exists or not in database
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 400 })
    }

    // check if user is deleted or not
    if (user.isDeleted) {
      return NextResponse.json({ message: 'This account has been deleted' }, { status: 404 })
    }

    // exclude password from user object
    if (user.password) delete user.password

    const token = sign(user, process.env.NEXTAUTH_SECRET!, { expiresIn: '30d' })

    // return response
    return NextResponse.json({ token, isNewUser, message: 'Token is here' }, { status: 200 })
  } catch (err: any) {
    return NextResponse.json({ message: err.message || err.error }, { status: 500 })
  }
}
