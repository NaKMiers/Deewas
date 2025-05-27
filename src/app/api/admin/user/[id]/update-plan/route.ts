import { connectDatabase } from '@/config/database'
import { toUTC } from '@/lib/time'
import UserModel from '@/models/UserModel'
import moment from 'moment-timezone'
import { NextRequest, NextResponse } from 'next/server'

// Models: User
import '@/models/UserModel'

// [PUT]: /admin/user/:id/update-plan
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  console.log('- Update User Plan -')

  try {
    const { id } = await params
    const { plan, planExpiredAt, purchasedAtPlatform } = await req.json()
    console.log(plan)

    // connect to database
    await connectDatabase()

    let user = await UserModel.findById(id).lean()

    if (plan === 'free' || plan === 'premium-lifetime') {
      user = await UserModel.findByIdAndUpdate(
        id,
        { $set: { plan, purchasedAtPlatform, planExpiredAt: null } },
        { new: true }
      ).lean()
    } else if (plan === 'premium-monthly' || plan === 'premium-yearly') {
      if (!planExpiredAt) {
        return NextResponse.json(
          { message: 'Plan expiration date is required for premium plans' },
          { status: 400 }
        )
      }

      user = await UserModel.findByIdAndUpdate(
        id,
        { $set: { plan, purchasedAtPlatform, planExpiredAt: toUTC(moment(planExpiredAt).toDate()) } },
        { new: true }
      ).lean()
    }

    // return response
    return NextResponse.json({ user, message: 'Updated User Plan' }, { status: 200 })
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 })
  }
}
