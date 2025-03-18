import { connectDatabase } from '@/config/database'
import UserModel from '@/models/UserModel'
import { NextRequest, NextResponse } from 'next/server'

import { initCategories } from '@/constants/categories'
import CategoryModel from '@/models/CategoryModel'
import SettingsModel from '@/models/SettingsModel'
import WalletModel from '@/models/WalletModel'

// Models: User
import '@/models/UserModel'

// [POST]: /auth/register
export async function POST(req: NextRequest) {
  console.log('- Register -')

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

    // create new user
    await UserModel.create({
      username,
      email,
      password,
    })

    // get registered user
    const registeredUser: any = await UserModel.findOne({ email }).lean()

    // MARK: Create new user and init data
    // create new user with google information (auto verified email)
    const newUser = await UserModel.create({
      email,
      authType: 'local',
    })

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
    const { password: _, ...user } = registeredUser

    // return home page
    return NextResponse.json({ user, message: 'Register Successfully' }, { status: 200 })
  } catch (err) {
    return NextResponse.json(err, { status: 500 })
  }
}
