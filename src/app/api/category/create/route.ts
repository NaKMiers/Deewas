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
    const token = await getToken({ req })
    const userId = token?._id as string

    // check if user is logged in
    if (!userId) {
      return NextResponse.json({ message: 'Please login to continue' }, { status: 401 })
    }

    // get data from request body
    const { name, icon, type } = await req.json()

    const response = await createCategory(userId, name, icon, type)

    // return response
    return NextResponse.json(response, { status: 200 })
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 })
  }
}

export const createCategory = async (userId: string, name: string, icon: string, type: string) => {
  try {
    // connect to database
    await connectDatabase()

    // create category
    const category = await CategoryModel.create({
      user: userId,
      name,
      icon,
      type,
    })

    return { category: JSON.parse(JSON.stringify(category)), message: 'Created category' }
  } catch (err: any) {
    return err
  }
}
