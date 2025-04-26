import { toUTC } from '@/lib/time'
import { extractToken } from '@/lib/utils'
import UserModel from '@/models/UserModel'
import moment from 'moment-timezone'
import { NextRequest, NextResponse } from 'next/server'

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
    const { plan, paymentMethod } = await req.json()

    // VERIFY...

    const set: any = { plan, paymentMethod }

    switch (plan) {
      case 'trial-7':
        set.planExpireAt = toUTC(moment().add(7, 'days').toDate())
        break
      case 'trial-14':
        set.planExpireAt = toUTC(moment().add(14, 'days').toDate())
        break
      case 'trial-30':
        set.planExpireAt = toUTC(moment().add(30, 'days').toDate())
        break
      case 'premium-1m':
        set.planExpireAt = toUTC(moment().add(1, 'month').toDate())
        break
      case 'premium-3m':
        set.planExpireAt = toUTC(moment().add(3, 'months').toDate())
        break
      case 'premium-12m':
        set.planExpireAt = toUTC(moment().add(12, 'months').toDate())
        break
      case 'premium-lt':
        set.planExpireAt = null
        break
    }

    // update user
    const updatedUser = await UserModel.findByIdAndUpdate(userId, { $set: set }, { new: true })

    // check if user is updated
    if (!updatedUser) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 })
    }

    // response
    return NextResponse.json({ updatedUser, message: 'User plan updated to ' + plan }, { status: 200 })
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 })
  }
}
