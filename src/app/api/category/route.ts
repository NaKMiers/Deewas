import { connectDatabase } from '@/config/database'
import CategoryModel from '@/models/CategoryModel'
import { getToken } from 'next-auth/jwt'
import { NextRequest, NextResponse } from 'next/server'

// Models: Category
import '@/models/CategoryModel'

export const dynamic = 'force-dynamic'

// [GET]: /category
export async function GET(req: NextRequest) {
  console.log('- Get My Categories - ')

  try {
    // connect to database
    await connectDatabase()

    const token = await getToken({ req })
    const userId = token?._id

    // check if user is logged in
    if (!userId) {
      return NextResponse.json({ message: 'Please login to continue' }, { status: 401 })
    }

    // get user categories
    const categories = await CategoryModel.find({ user: userId, deleted: false }).lean()

    // return response
    return NextResponse.json({ categories, message: 'Categories are here' }, { status: 200 })
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 })
  }
}
