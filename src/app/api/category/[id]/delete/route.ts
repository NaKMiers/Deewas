import { connectDatabase } from '@/config/database'
import CategoryModel from '@/models/CategoryModel'
import TransactionModel from '@/models/TransactionModel'
import { getToken } from 'next-auth/jwt'
import { NextRequest, NextResponse } from 'next/server'

// Models: Category, Transaction
import '@/models/CategoryModel'
import '@/models/TransactionModel'

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

    // find category
    let category: any = await CategoryModel.findById(id).select('type amount').lean()
    if (!category) {
      return NextResponse.json({ message: 'Category not found' }, { status: 404 })
    }

    // get uncategorized category of this type
    const uncategorizedCategory = await CategoryModel.findOne({
      user: userId,
      type: category.type,
      deletable: false,
    }).select('_id')

    console.log('uncategorizedCategory', uncategorizedCategory)

    if (!uncategorizedCategory) {
      return NextResponse.json({ message: 'Failed to delete category' }, { status: 404 })
    }

    await Promise.all([
      // delete category
      CategoryModel.findByIdAndDelete(id),
      // move all transactions to uncategorized category
      TransactionModel.updateMany(
        { user: userId, category: id },
        { $set: { category: uncategorizedCategory._id } }
      ),
      // update total amount of uncategorized category
      CategoryModel.findByIdAndUpdate(uncategorizedCategory._id, {
        $inc: { amount: category.amount },
      }),
    ])

    // return response
    return NextResponse.json(
      { category, message: `Deleted ${category.icon} ${category.name} category` },
      { status: 200 }
    )
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 })
  }
}
