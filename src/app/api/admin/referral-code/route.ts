import { connectDatabase } from '@/config/database'
import { searchParamsToObject } from '@/lib/query'
import ReferralCodeModel from '@/models/ReferralCodeModel'
import { NextRequest, NextResponse } from 'next/server'

// Models: Referral Code, User
import '@/models/ReferralCodeModel'
import '@/models/UserModel'

export const dynamic = 'force-dynamic'

// [GET]: /admin/referral-code
export async function GET(req: NextRequest) {
  console.log('- Get All Referral Codes -')

  try {
    // connect to database
    await connectDatabase()

    // get query params
    const params: { [key: string]: string[] } = searchParamsToObject(req.nextUrl.searchParams)

    // options
    let skip = 0
    let itemPerPage = 9
    const filter: { [key: string]: any } = {}
    let sort: { [key: string]: any } = { updatedAt: -1 } // default sort

    // build filter
    for (const key in params) {
      if (params.hasOwnProperty(key)) {
        // Special Cases ---------------------
        if (key === 'page') {
          const page = +params[key][0]
          skip = (page - 1) * itemPerPage
          continue
        }

        if (key === 'search') {
          const searchFields = ['code', 'desc']

          filter.$or = searchFields.map(field => ({
            [field]: { $regex: params[key][0], $options: 'i' },
          }))
          continue
        }

        if (key === 'sort') {
          sort = {
            [params[key][0].split('|')[0]]: +params[key][0].split('|')[1],
          }
          continue
        }

        // Normal Cases ---------------------
        filter[key] = params[key].length === 1 ? params[key][0] : { $in: params[key] }
      }
    }

    // get amount of account
    const amount = await ReferralCodeModel.countDocuments(filter)

    // get all referral codes from database
    const referralCodes = await ReferralCodeModel.find(filter)
      .populate('owner', 'name email')
      .sort(sort)
      .skip(skip)
      .limit(itemPerPage)
      .lean()

    // return referral codes
    return NextResponse.json({ referralCodes, amount }, { status: 200 })
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 })
  }
}
