import { connectDatabase } from '@/config/database'
import ReferralCodeModel from '@/models/ReferralCodeModel'
import { NextRequest, NextResponse } from 'next/server'

// Models: Referral Codes
import '@/models/ReferralCodeModel'

// [POST]: /admin/referral-code/add
export async function POST(req: NextRequest) {
  console.log('- Add Referral Code -')

  try {
    // connect to database
    await connectDatabase()

    // get data to create referralCode
    const { code, desc, owner, active } = await req.json()

    // get referral code with code from database
    const referralCode = await ReferralCodeModel.findOne({ code }).lean()

    // return error if referralCode has already existed
    if (referralCode) {
      return NextResponse.json({ message: 'Referral code has already existed' }, { status: 400 })
    }

    // create new referralCode
    const newReferralCode = new ReferralCodeModel({
      code,
      desc,
      owner: owner || null,
      active,
    })

    // save new referral code to database
    await newReferralCode.save()

    // return response
    return NextResponse.json(
      { newReferralCode, message: `Referral code "${newReferralCode.code}" has been created` },
      { status: 201 }
    )
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 })
  }
}
