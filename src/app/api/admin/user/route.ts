import { connectDatabase } from '@/config/database'
import { searchParamsToObject } from '@/lib/query'
import UserModel from '@/models/UserModel'
import { NextRequest, NextResponse } from 'next/server'

// Models: User
import '@/models/UserModel'

export const dynamic = 'force-dynamic'

// [GET] /admin/user/all
export async function GET(req: NextRequest) {
  console.log('- Get All Users -')

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
          const searchFields = ['username', 'email', 'name']

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

        if (key === 'isDeleted') {
          filter[key] = params[key][0] === 'true' ? true : { $ne: true }
          continue
        }

        // Normal Cases ---------------------
        filter[key] = params[key].length === 1 ? params[key][0] : { $in: params[key] }
      }
    }

    // get amount of account
    const amount = await UserModel.countDocuments(filter)

    // get all users from database
    const users = await UserModel.find(filter).sort(sort).skip(skip).limit(itemPerPage).lean()

    // return response
    return NextResponse.json({ users, amount }, { status: 200 })
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 })
  }
}
