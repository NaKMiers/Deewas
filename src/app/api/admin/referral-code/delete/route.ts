import { connectDatabase } from '@/config/database'
import ReferralCodeModel from '@/models/ReferralCodeModel'
import { NextRequest, NextResponse } from 'next/server'

// Models: Referral Code
import '@/models/ReferralCodeModel'

// [DELETE]: /admin/referral-code/delete
export async function DELETE(req: NextRequest) {
  console.log('- Delete Referral Codes - ')

  try {
    // connect to database
    await connectDatabase()

    // get Referral code ids to delete
    const { ids } = await req.json()

    // get delete Referral codes
    const deletedReferralCodes = await ReferralCodeModel.find({ _id: { $in: ids } }).lean()

    // delete Referral code from database
    await ReferralCodeModel.deleteMany({ _id: { $in: ids } })

    // return response
    return NextResponse.json(
      {
        deletedReferralCodes,
        message: `Referral code ${deletedReferralCodes
          .map(ReferralCode => `"${ReferralCode.code}"`)
          .reverse()
          .join(', ')} ${deletedReferralCodes.length > 1 ? 'have' : 'has'} been deleted`,
      },
      { status: 200 }
    )
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 })
  }
}
