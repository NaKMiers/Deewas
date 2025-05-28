import { connectDatabase } from '@/config/database'
import UserModel from '@/models/UserModel'
import bcrypt from 'bcrypt'
import { sign } from 'jsonwebtoken'
import { NextRequest, NextResponse } from 'next/server'

// Models: User
import '@/models/UserModel'

// [POST]: /auth/sign-in/credentials
export async function POST(req: NextRequest) {
  console.log('- Sign In With Credentials -')

  try {
    // get data from request body
    let { usernameOrEmail, password } = await req.json()
    usernameOrEmail = usernameOrEmail.trim().toLowerCase()

    if (!usernameOrEmail || !password) {
      return NextResponse.json({ message: 'Please fill all fields' }, { status: 400 })
    }

    // connect to database
    await connectDatabase()

    // find user from database
    const user: any = await UserModel.findOne({
      $or: [{ email: usernameOrEmail }, { username: usernameOrEmail }],
    }).lean()

    // check user exists or not in database
    if (!user) {
      return NextResponse.json({ message: 'Incorrect username or email' }, { status: 400 })
    }

    // check if user is deleted or not
    if (user.isDeleted) {
      return NextResponse.json({ message: 'This account has been deleted' }, { status: 404 })
    }

    // user does not have password
    if (!user.password) {
      return NextResponse.json(
        { message: 'This account is authenticated by ' + user.authType },
        { status: 400 }
      )
    }

    // check password
    const isValidPassword = await bcrypt.compare(password, user.password)
    if (!isValidPassword) {
      // push error to call back
      return NextResponse.json({ message: 'Incorrect username or email' }, { status: 400 })
    }

    // exclude password from user who have just logged in
    const { password: _, ...otherDetails } = user

    const token = sign(otherDetails, process.env.NEXTAUTH_SECRET!, { expiresIn: '30d' })

    // return response
    return NextResponse.json({ token, message: 'Token is here' }, { status: 200 })
  } catch (err: any) {
    return NextResponse.json({ message: err.message || err.error }, { status: 500 })
  }
}
