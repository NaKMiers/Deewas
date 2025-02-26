import { connectDatabase } from '@/config/database'
import CategoryModel from '@/models/CategoryModel'
import { getToken } from 'next-auth/jwt'
import { NextRequest, NextResponse } from 'next/server'

// Models: Category
import '@/models/CategoryModel'

// [DELETE]: /category/:id/delete
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  console.log('- Delete Category -')

  try {
    // connect to database
    await connectDatabase()

    const token = await getToken({ req })
    const userId = token?._id

    // check if user is logged in
    if (!userId) {
      return NextResponse.json({ message: 'Please login to continue' }, { status: 401 })
    }

    // get category id form params
    const { id } = await params

    // get category user id to check authorization
    const categoryUserId = await CategoryModel.findById(id).distinct('user').lean()

    // check authorization
    if (categoryUserId[0].toString() !== userId) {
      return NextResponse.json(
        { message: 'You are now allowed to delete this category' },
        { status: 401 }
      )
    }

    // "soft" delete category
    let category = await CategoryModel.findByIdAndUpdate(id, { $set: { deleted: true } }).lean()

    // return response
    return NextResponse.json({ category, message: 'Deleted category' }, { status: 200 })
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 })
  }
}
