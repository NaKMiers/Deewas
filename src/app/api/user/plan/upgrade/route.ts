import { updateUserPlan } from '@/app/api/revenuecat-event'
import { extractToken } from '@/lib/utils'
import { getRevenueCatSubscriberApi } from '@/requests'
import { sign } from 'jsonwebtoken'
import { NextRequest, NextResponse } from 'next/server'

// Models: User
import '@/models/UserModel'

// [PUT]: /user/plan/upgrade
export async function PUT(req: NextRequest) {
  console.log('- Upgrade User - ')

  try {
    const token = await extractToken(req)
    const userId = token?._id as string

    // check if user is logged in
    if (!userId) {
      return NextResponse.json({ message: 'Please login to continue' }, { status: 401 })
    }

    // get data from request body
    const { appUserId, platform } = await req.json()

    // VERIFY...
    const data = await getRevenueCatSubscriberApi(userId)

    const activeEntitlement = data.subscriber.entitlements?.['Premium']

    if (!activeEntitlement) {
      return NextResponse.json({ message: 'User is not active' }, { status: 401 })
    }

    // active user
    const updatedUser = await updateUserPlan(userId, 'active', activeEntitlement, platform)

    // check if user is updated
    if (!updatedUser) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 })
    }

    // exclude password from user object
    if (updatedUser.password) delete updatedUser.password
    const newToken = sign(updatedUser, process.env.NEXTAUTH_SECRET!, { expiresIn: '30d' })

    // response
    return NextResponse.json(
      { token: newToken, message: 'User plan updated to ' + updatedUser.plan },
      { status: 200 }
    )
  } catch (err: any) {
    return NextResponse.json({ message: err.message || err.error }, { status: 500 })
  }
}
