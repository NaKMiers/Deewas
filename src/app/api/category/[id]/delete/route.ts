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
    const token = await getToken({ req })
    const userId = token?._id as string

    // check if user is logged in
    if (!userId) {
      return NextResponse.json({ message: 'Please login to continue' }, { status: 401 })
    }

    // get category id form params
    const { id } = await params

    const response = await deleteCategory(userId, id)

    // return response
    return NextResponse.json(response, { status: 200 })
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 })
  }
}

export const deleteCategory = async (userId: string, categoryId: string) => {
  // connect to database
  await connectDatabase()

  // find category
  let category: any = await CategoryModel.findById(categoryId).lean()

  // check if category exists
  if (!category) {
    throw new Error('Category not found')
  }

  // check if category is deletable
  if (category.deletable === false) {
    throw new Error('Cannot delete default category')
  }

  // get uncategorized category of this type
  const uncategorizedCategory = await CategoryModel.findOne({
    user: userId,
    type: category.type,
    deletable: false,
  }).select('_id')

  if (!uncategorizedCategory) {
    throw new Error('Failed to delete category')
  }

  await Promise.all([
    // delete category
    CategoryModel.findByIdAndDelete(categoryId),
    // move all transactions to uncategorized category
    TransactionModel.updateMany(
      { user: userId, category: categoryId },
      { $set: { category: uncategorizedCategory._id } }
    ),
    // update total amount of uncategorized category
    CategoryModel.findByIdAndUpdate(uncategorizedCategory._id, {
      $inc: { amount: category.amount },
    }),
  ])

  return {
    category: JSON.parse(JSON.stringify(category)),
    message: `Deleted ${category.icon} ${category.name} category`,
  }
}
