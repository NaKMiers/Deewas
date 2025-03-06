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
    const token = await getToken({ req })
    const userId = token?._id as string

    // check if user is logged in
    if (!userId) {
      return NextResponse.json({ message: 'Please login to continue' }, { status: 401 })
    }

    const { searchParams } = new URL(req.nextUrl)
    const params = Object.fromEntries(searchParams.entries())

    const response = await getCategories(userId, params)

    // return response
    return NextResponse.json(response, { status: 200 })
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 })
  }
}

export const getCategories = async (userId: string, params: any = {}) => {
  try {
    // connect to database
    await connectDatabase()

    const filter: any = { user: userId }
    Object.keys(params).forEach(key => {
      if (params[key]) {
        filter[key] = params[key]
      }
    })

    // get user categories
    const categories = await CategoryModel.find(filter).lean()

    return { categories: JSON.parse(JSON.stringify(categories)), message: 'Categories are here' }
  } catch (err: any) {
    throw new Error(err)
  }
}
