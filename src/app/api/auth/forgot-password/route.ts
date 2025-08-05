import { connectDatabase } from '@/config/database'
import { sendResetPasswordEmail } from '@/lib/mailSending'
import { shortName } from '@/lib/string'
import UserModel from '@/models/UserModel'
import jwt from 'jsonwebtoken'
import { NextRequest, NextResponse } from 'next/server'

// Models: User
import '@/models/UserModel'

// [POST]: /auth/forgot-password
export async function POST(req: NextRequest) {
  console.log('- Forgot Password -')

  try {
    // connect to database
    await connectDatabase()

    // get email to send link to reset password
    const { email } = await req.json()

    // get user by email
    const user: any = await UserModel.findOne({ email }).lean()

    // check if email exists
    if (!user) {
      return NextResponse.json({ message: 'Email not found' }, { status: 404 })
    }

    // check if user is deleted or not
    if (user.isDeleted) {
      return NextResponse.json({ message: 'This account has been deleted' }, { status: 404 })
    }

    // user does not have password
    if (!user.password) {
      return NextResponse.json(
        {
          message: `This account is authenticated by ${user.authType}, you can't reset password`,
        },
        { status: 500 }
      )
    }

    // ready for sending email
    const token = jwt.sign({ email }, process.env.NEXTAUTH_SECRET!, { expiresIn: '2h' })
    const link = `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password?token=${token}`

    // send email
    await sendResetPasswordEmail(email, shortName(user), link)

    // return response
    return NextResponse.json({
      sending: true,
      email,
      message: 'Reset password link has been sent to your email, please check your inbox',
    })
  } catch (err: any) {
    return NextResponse.json({ message: err.message || err.error }, { status: 500 })
  }
}
