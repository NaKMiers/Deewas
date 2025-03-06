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

    const response = await updateCategory(id, name, icon)

    // return response
    return NextResponse.json(response, { status: 200 })
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 })
  }
}

export const updateCategory = async (categoryId: string, name: string, icon: string) => {
  // connect to database
  await connectDatabase()

  // update category
  const category: ICategory | null = (await CategoryModel.findByIdAndUpdate(
    categoryId,
    { $set: { name, icon } },
    { new: true }
  ).lean()) as any

  // check if category exists
  if (!category) {
    throw new Error('Category not found')
  }

  return { category: JSON.parse(JSON.stringify(category)), message: 'Updated category' }
}
