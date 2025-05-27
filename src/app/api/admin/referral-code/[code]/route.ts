import { connectDatabase } from '@/config/database'
import ReferralCodeModel from '@/models/ReferralCodeModel'
import { NextRequest, NextResponse } from 'next/server'

// Models: Referral Code, User
import '@/models/ReferralCodeModel'
import '@/models/UserModel'

export const dynamic = 'force-dynamic'

// [GET]: /admin/referral-code/:id
export async function GET(req: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  console.log('- Get Referral Code -')

  try {
    const { code } = await params

    // connect to database
    await connectDatabase()

    // get referral code from database
    const referralCode = await ReferralCodeModel.findOne({ code }).populate('owner').lean()

    // check referralCode
    if (!referralCode) {
      return NextResponse.json({ message: 'Referral code not found' }, { status: 404 })
    }

    // return referralCode
    return NextResponse.json({ referralCode, message: 'Referral code found' }, { status: 200 })
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 })
  }
}
