import { connectDatabase } from '@/config/database'
import { initCategories } from '@/constants/categories'
import CategoryModel from '@/models/CategoryModel'
import SettingsModel from '@/models/SettingsModel'
import UserModel from '@/models/UserModel'
import WalletModel from '@/models/WalletModel'
import * as jose from 'jose'
import { sign } from 'jsonwebtoken'
import { NextRequest, NextResponse } from 'next/server'

// Models: Wallet, Category, Settings, User
import '@/models/CategoryModel'
import '@/models/SettingsModel'
import '@/models/UserModel'
import '@/models/WalletModel'

// [POST]: /auth/sign-in/google
export async function POST(req: NextRequest) {
  console.log('- Sign In With Apple -')

  try {
    // get data from request body
    const { idToken, appleUserId, nonce } = await req.json()

    // check if idToken is exist
    if (!idToken || !appleUserId) {
      return NextResponse.json({ message: 'ID is required' }, { status: 400 })
    }

    // verify id token
    const jwks = jose.createRemoteJWKSet(new URL('https://appleid.apple.com/auth/keys'))
    const { payload }: any = await jose.jwtVerify(idToken, jwks, {
      issuer: 'https://appleid.apple.com',
      audience: process.env.APPLE_CLIENT_ID,
    })

    // check if payload is valid
    if (!payload) {
      return NextResponse.json({ message: 'Invalid ID token' }, { status: 401 })
    }

    // get data from payload
    const { email, sub, iss, aud, nonce_supported } = payload

    // verify required claims are present
    if (!email || !sub || !iss || !aud || !nonce) {
      return NextResponse.json({ message: 'Missing required claims in token' }, { status: 401 })
    }

    // verify nonce
    if (nonce_supported && payload.nonce !== nonce) {
      return NextResponse.json({ message: 'Nonce mismatch' }, { status: 401 })
    }

    // connect to database
    await connectDatabase()

    // find user from database
    let user: any = await UserModel.findOneAndUpdate(
      { $or: [{ email }, { appleUserId: sub }] },
      { $set: { authType: 'apple', appleUserId } },
      { new: true }
    ).lean()

    let isNewUser = false

    // check if user exists
    if (!user) {
      // create new user
      const newUser = await UserModel.create({
        email,
        authType: 'apple',
        appleUserId,
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
    console.log(err)
    return NextResponse.json({ message: err.message || err.error }, { status: 500 })
  }
}
