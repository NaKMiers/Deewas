import { connectDatabase } from '@/config/database'
import UserModel from '@/models/UserModel'
import { OAuth2Client } from 'google-auth-library'
import { sign } from 'jsonwebtoken'
import { NextRequest, NextResponse } from 'next/server'

// Models: User
import '@/models/UserModel'

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)

// [POST]: /auth/sign-in/google
export async function POST(req: NextRequest) {
  console.log('- Sign In With Google -')

  try {
    // get data from request body
    const { idToken } = await req.json()

    console.log('idToken', idToken)

    // check if idToken is exist
    if (!idToken) {
      return NextResponse.json({ message: 'ID token is required' }, { status: 400 })
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

    // get data from payload
    const { email, name, picture: avatar } = payload

    // connect to database
    await connectDatabase()

    // find user from database
    let user: any = await UserModel.findOneAndUpdate(
      { email: payload.email },
      { $set: { name, avatar, authType: 'google' } },
      { new: true }
    ).lean()

    let isNewUser = false

    // check if user exists
    if (!user) {
      // create new user
      user = await UserModel.create({
        email,
        username: email.split('@')[0],
        name,
        avatar,
        authType: 'google',
      })

      isNewUser = true
    }

    // check user exists or not in database
    if (!user) {
      return NextResponse.json({ message: 'Incorrect username or email' }, { status: 400 })
    }

    const { password: _, ...otherDetails } = user
    const token = sign(otherDetails, process.env.NEXTAUTH_SECRET!, { expiresIn: '30d' })

    // return response
    return NextResponse.json({ token, isNewUser, message: 'Token is here' }, { status: 200 })
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 })
  }
}
