import { connectDatabase } from '@/config/database'
import { initCategories } from '@/constants/categories'
import CategoryModel from '@/models/CategoryModel'
import SettingsModel from '@/models/SettingsModel'
import UserModel from '@/models/UserModel'
import WalletModel from '@/models/WalletModel'
import { OAuth2Client } from 'google-auth-library'
import { sign } from 'jsonwebtoken'
import { NextRequest, NextResponse } from 'next/server'

// Models: Wallet, Category, Settings, User
import '@/models/CategoryModel'
import '@/models/SettingsModel'
import '@/models/UserModel'
import '@/models/WalletModel'

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)

// [POST]: /auth/sign-in/google
export async function POST(req: NextRequest) {
  console.log('- Sign In With Google -')

  try {
    // get data from request body
    const { idToken, googleUserId } = await req.json()

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
      { $set: { avatar, authType: 'google' } },
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
      })
      user = newUser._doc

      isNewUser = true

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
    }

    // check user exists or not in database
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 400 })
    }

    // exclude password from user object
    if (user.password) delete user.password

    const token = sign(user, process.env.NEXTAUTH_SECRET!, { expiresIn: '30d' })

    // return response
    return NextResponse.json({ token, isNewUser, message: 'Token is here' }, { status: 200 })
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 })
  }
}
