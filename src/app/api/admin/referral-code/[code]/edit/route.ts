import { connectDatabase } from '@/config/database'
import ReferralCodeModel from '@/models/ReferralCodeModel'
import { NextRequest, NextResponse } from 'next/server'

// Models: Referral Code
import '@/models/ReferralCodeModel'

// [PUT]: /api/admin/referral-code/:code/edit
export async function PUT(req: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  console.log('- Edit Referral Code -')

  try {
    const { code } = await params

    // connect to database
    await connectDatabase()

    // get data to edit
    const { code: newCode, desc, owner, active } = await req.json()

    // update ReferralCode
    await ReferralCodeModel.findOneAndUpdate(
      { code },
      {
        $set: {
          code: newCode,
          desc,
          owner: owner || null,
          active,
        },
      }
    )

    return NextResponse.json({ message: 'Referral code has been updated' }, { status: 200 })
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 })
  }
}
