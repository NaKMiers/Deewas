import { connectDatabase } from '@/config/database'
import { getMessagesByLocale, initCategories } from '@/constants/categories'
import CategoryModel from '@/models/CategoryModel'
import SettingsModel from '@/models/SettingsModel'
import UserModel from '@/models/UserModel'
import WalletModel from '@/models/WalletModel'
import { sign } from 'jsonwebtoken'
import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcrypt'
import { createTranslator } from 'next-intl'

// Models: User, Category, Settings, Wallet
import '@/models/CategoryModel'
import '@/models/SettingsModel'
import '@/models/UserModel'
import '@/models/WalletModel'

// [POST]: /auth/sign-up/credentials
export async function POST(req: NextRequest) {
  console.log('- Sign Up With Credentials -')

  try {
    // get data from request body
    let { username, email, password, locale } = await req.json()
    username = username.trim().toLowerCase()
    email = email.trim().toLowerCase()
    locale = locale || 'en'

    // connect to database
    await connectDatabase()

    // check if user is already exist in database
    const existingUser: any = await UserModel.findOne({
      $or: [{ email }, { username }],
    }).lean()

    // check if user is already exist in database
    if (existingUser) {
      return NextResponse.json({ message: 'Username or email exists' }, { status: 401 })
    }

    const hashedPassword = await bcrypt.hash(password, +process.env.BCRYPT_SALT_ROUND! || 10)

    // create new user
    const user = await UserModel.create({
      username,
      email,
      password: hashedPassword,
      authType: 'local',
    })

    // get registered user
    const newUser: any = await UserModel.findById(user._id).lean()

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

    // exclude password from user object
    const { password: _, ...otherDetails } = newUser

    const token = sign(otherDetails, process.env.NEXTAUTH_SECRET!, { expiresIn: '30d' })

    // return home page
    return NextResponse.json({ token, message: 'Token is here' }, { status: 200 })
  } catch (err: any) {
    console.log(err)
    return NextResponse.json({ message: err.message || err.error }, { status: 500 })
  }
}
