import { connectDatabase } from '@/config/database'
import UserModel from '@/models/UserModel'
import { NextRequest, NextResponse } from 'next/server'
import { initCategories } from '@/constants/categories'
import CategoryModel from '@/models/CategoryModel'
import SettingsModel from '@/models/SettingsModel'
import WalletModel from '@/models/WalletModel'
import bcrypt from 'bcrypt'

// Models: User, Category, Settings, Wallet
import '@/models/CategoryModel'
import '@/models/SettingsModel'
import '@/models/UserModel'
import '@/models/WalletModel'

// [POST]: /auth/sign-up
export async function POST(req: NextRequest) {
  console.log('- Sign Up -')

  try {
    // connect to database
    await connectDatabase()

    let { username, email, password } = await req.json()
    username = username.toLowerCase()
    email = email.toLowerCase()

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
    await UserModel.create({
      email,
      username,
      password: hashedPassword,
      authType: 'local',
    })

    // get registered user
    const newUser: any = await UserModel.findOne({ email }).lean()

    // MARK: Create new user and init data
    const categories = Object.values(initCategories)
      .flat()
      .map(category => ({
        ...category,
        user: newUser._id,
      }))

    // Insert default categories
    await CategoryModel.insertMany(categories)

    await Promise.all([
      // create initial wallet
      WalletModel.create({
        user: newUser._id,
        name: 'Cash',
        icon: '💰',
      }),
      // initially create settings
      SettingsModel.create({
        user: newUser._id,
      }),
    ])

    // exclude password from user object
    const { password: _, ...user } = newUser

    // return home page
    return NextResponse.json({ user, message: 'Register Successfully' }, { status: 200 })
  } catch (err: any) {
    return NextResponse.json({ message: err.message || err.error }, { status: 500 })
  }
}
