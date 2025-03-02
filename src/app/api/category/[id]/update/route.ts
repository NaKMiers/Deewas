import { connectDatabase } from '@/config/database'
import CategoryModel, { ICategory } from '@/models/CategoryModel'
import { getToken } from 'next-auth/jwt'
import { NextRequest, NextResponse } from 'next/server'

// Models: Category
import '@/models/CategoryModel'

// [PUT]: /category/:id/update
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  console.log('- Update Category -')

  try {
    // connect to database
    await connectDatabase()

    const token = await getToken({ req })
    const userId = token?._id

    // check if user is logged in
    if (!userId) {
      return NextResponse.json({ message: 'Please login to continue' }, { status: 401 })
    }

    // get category id from request params
    const { id } = await params

    // get data from request body
    const { name, icon } = await req.json()

    // update category
    const category: ICategory | null = (await CategoryModel.findByIdAndUpdate(
      id,
      { $set: { name, icon } },
      { new: true }
    ).lean()) as any

    // check if category exists
    if (!category) {
      return NextResponse.json({ message: 'Category not found' }, { status: 404 })
    }

    // return response
    return NextResponse.json({ category, message: 'Updated category' }, { status: 200 })
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 })
  }
}
