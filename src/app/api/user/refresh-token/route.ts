import { extractToken } from '@/lib/utils'
import UserModel from '@/models/UserModel'
import { sign } from 'jsonwebtoken'
import { NextRequest, NextResponse } from 'next/server'

// Models: User
import '@/models/UserModel'

export const dynamic = 'force-dynamic'

// [GET]: /user/refresh-token
export async function GET(req: NextRequest) {
  console.log('- Refresh Token - ')

  try {
    const token = await extractToken(req)
    const userId = token?._id as string

    // check if user is logged in
    if (!userId) {
      return NextResponse.json({ message: 'Please login to continue' }, { status: 401 })
    }

    // get user
    const user: any = await UserModel.findById(userId).lean()

    // check if user is updated
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 })
    }

    // exclude password from user object
    if (user.password) delete user.password
    const newToken = sign(user, process.env.NEXTAUTH_SECRET!, { expiresIn: '30d' })

    // response
    return NextResponse.json({ token: newToken }, { status: 200 })
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 })
  }
}
