import { connectDatabase } from '@/config/database'
import CategoryModel from '@/models/CategoryModel'
import { getToken } from 'next-auth/jwt'
import { NextRequest, NextResponse } from 'next/server'

// Models: Category
import '@/models/CategoryModel'
import TransactionModel from '@/models/TransactionModel'

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

    // check authorization
    let cat: any = await CategoryModel.findById(id).select('user type')

    if (cat.user.toString() !== userId) {
      return NextResponse.json(
        { message: 'You are not allowed to update this category' },
        { status: 401 }
      )
    }

    // get data from request body
    const { name, icon, type } = await req.json()

    const promises = []

    // update category
    promises.push(CategoryModel.findByIdAndUpdate(id, { name, icon, type }, { new: true }).lean())

    // category type is changed
    if (cat.type !== type) {
      console.log('ddd')
      // update type of all transactions of this category
      promises.push(TransactionModel.updateMany({ category: id }, { $set: { type } }))
    }

    const [category] = await Promise.all(promises)

    // return response
    return NextResponse.json({ category, message: 'Updated category' }, { status: 200 })
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 })
  }
}
