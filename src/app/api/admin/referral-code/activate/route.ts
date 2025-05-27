import { connectDatabase } from '@/config/database'
import { NextRequest, NextResponse } from 'next/server'
import ReferralCodeModel from '@/models/ReferralCodeModel'

// Models: Referral Code
import '@/models/ReferralCodeModel'

// [PATCH]: /admin/referral-code/activate
export async function PATCH(req: NextRequest) {
  console.log('- Activate Referral Codes - ')

  try {
    // connect to database
    await connectDatabase()

    // get referral code id to delete
    const { ids, value } = await req.json()

    // update referral codes from database
    await ReferralCodeModel.updateMany({ _id: { $in: ids } }, { $set: { active: value || false } })

    // get updated referral codes
    const updatedReferralCodes = await ReferralCodeModel.find({ _id: { $in: ids } }).lean()

    if (!updatedReferralCodes.length) {
      return NextResponse.json({ message: 'No referral codes found' }, { status: 404 })
    }

    // return response
    return NextResponse.json(
      {
        updatedReferralCodes,
        message: `Referral code ${updatedReferralCodes
          .map(referralCode => `"${referralCode.code}"`)
          .reverse()
          .join(', ')} ${updatedReferralCodes.length > 1 ? 'have' : 'has'} been ${
          value ? 'activated' : 'deactivated'
        }`,
      },
      { status: 200 }
    )
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 })
  }
}
