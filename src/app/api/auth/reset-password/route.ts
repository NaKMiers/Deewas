import { connectDatabase } from '@/config/database'
import UserModel from '@/models/UserModel'
import bcrypt from 'bcrypt'
import jwt, { JwtPayload } from 'jsonwebtoken'
import { NextRequest, NextResponse } from 'next/server'

// Models: User
import '@/models/UserModel'

// [PATCH]: /auth/reset-password
export async function PATCH(req: NextRequest) {
  console.log('- Reset Password -')

  try {
    // connect to database
    await connectDatabase()

    // get email and token from query
    const searchParams = req.nextUrl.searchParams
    const token = searchParams.get('token')

    // get new password from req body
    const { newPassword } = await req.json()

    // if token is not exist
    if (!token) {
      return NextResponse.json({ message: 'You are not allowed to reset password' }, { status: 401 })
    }

    // check if email and token are exist
    if (token) {
      // Verify the token
      const decode = jwt.verify(token, process.env.NEXTAUTH_SECRET!) as JwtPayload

      // check decode is exist
      if (!decode) {
        return NextResponse.json({ message: 'You are not allowed to reset password' }, { status: 401 })
      }

      // check expired time
      const currentTime = Math.floor(Date.now() / 1000)
      if ((decode.exp || 0) < currentTime) {
        return NextResponse.json({ message: 'Your reset link has been expired' }, { status: 401 })
      }

      // hash new password
      const hashedPassword = await bcrypt.hash(newPassword, +process.env.BCRYPT_SALT_ROUND!)
      await UserModel.findOneAndUpdate({ email: decode.email }, { $set: { password: hashedPassword } })

      // return success message
      return NextResponse.json({ message: 'Reset password successfully' })
    }
  } catch (err: any) {
    return NextResponse.json({ message: err.message || err.error }, { status: 500 })
  }
}
