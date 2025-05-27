import { toUTC } from '@/lib/time'
import { checkPremium, extractToken } from '@/lib/utils'
import ReferralCodeModel from '@/models/ReferralCodeModel'
import SettingsModel from '@/models/SettingsModel'
import UserModel, { IUser } from '@/models/UserModel'
import moment from 'moment-timezone'
import { NextRequest, NextResponse } from 'next/server'

// Models: User, Referral Code
import '@/models/ReferralCodeModel'
import '@/models/UserModel'

// [POST]: /referral-code
export async function POST(req: NextRequest) {
  console.log('- Referral Code -')

  try {
    const token = await extractToken(req)
    const userId = token?._id as string

    // check if user is logged in
    if (!userId) {
      return NextResponse.json({ message: 'Please login to continue' }, { status: 401 })
    }

    // get referral code from request body
    let { code, platform } = await req.json()
    code = code?.trim().toUpperCase()

    console.log(code, platform)

    // get user settings
    const userSettings: any = await SettingsModel.findOne({ user: userId }).select('referralCode').lean()

    // check if user settings exist
    if (!userSettings) {
      return NextResponse.json(
        { errorCode: 'SOMETHING_WENT_WRONG', message: 'Something went wrong' },
        { status: 404 }
      )
    }

    // check if user has already used a referral code
    if (userSettings?.referralCode) {
      return NextResponse.json(
        { errorCode: 'RFCODE_ALREADY_USED', message: 'You have already used this referral code' },
        { status: 401 }
      )
    }

    // get referral code from database to apply
    const referralCode: any = await ReferralCodeModel.findOne({ code }).populate('owner').lean()

    // if referral code does not exist
    if (!referralCode || !referralCode.active) {
      return NextResponse.json(
        { errorCode: 'RFCODE_NOT_EXISTS', message: 'Referral code does not exist' },
        { status: 404 }
      )
    }

    const isPremium = checkPremium(token)
    console.log(isPremium)

    // prevent user use their own referral code
    const owner: IUser = referralCode.owner as IUser
    if (owner._id.toString() === userId.toString()) {
      return NextResponse.json(
        { errorCode: 'RFCODE_OWNER_USED', message: 'You cannot use your own referral code' },
        { status: 401 }
      )
    }

    const promises: any[] = [
      // update user settings with referral code
      SettingsModel.updateOne({ user: userId }, { $set: { referralCode: code } }),
      // add user to used users of the referral code
      ReferralCodeModel.updateOne({ code }, { $addToSet: { usedUsers: userId } }),
    ]

    if (!isPremium) {
      promises.push(
        UserModel.findByIdAndUpdate(userId, {
          $set: {
            plan: 'premium-monthly',
            planExpiredAt: toUTC(moment().add(2, 'days').toDate()),
            purchasedAtPlatform: platform || 'ios',
          },
        })
      )
    }

    await Promise.all(promises)

    // return response
    return NextResponse.json({ message: '' }, { status: 200 })
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 })
  }
}
