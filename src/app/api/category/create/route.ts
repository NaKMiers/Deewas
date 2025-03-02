import { connectDatabase } from '@/config/database'
import CategoryModel from '@/models/CategoryModel'
import { getToken } from 'next-auth/jwt'
import { NextRequest, NextResponse } from 'next/server'

// Models: Category
import '@/models/CategoryModel'

// [POST]: /category/create
export async function POST(req: NextRequest) {
  console.log('- Create Category -')

  try {
    // connect to database
    await connectDatabase()

    const token = await getToken({ req })
    const userId = token?._id

    // check if user is logged in
    if (!userId) {
      return NextResponse.json({ message: 'Please login to continue' }, { status: 401 })
    }

    // get data from request body
    const { name, icon, type } = await req.json()

    // create category
    const category = await CategoryModel.create({
      user: userId,
      name,
      icon,
      type,
    })

    // return response
    return NextResponse.json({ category, message: 'Created category' }, { status: 200 })
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 })
  }
}
