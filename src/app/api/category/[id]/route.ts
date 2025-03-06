import { connectDatabase } from '@/config/database'
import CategoryModel from '@/models/CategoryModel'
import { NextRequest, NextResponse } from 'next/server'

// Models: Category
import '@/models/CategoryModel'

// [GET]: /api/category/:id
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  console.log('- Get Category -')

  try {
    // get category id
    const { id } = await params

    const response = await getCategory(id)

    // return response
    return NextResponse.json(response, { status: 200 })
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 })
  }
}

export const getCategory = async (categoryId: string) => {
  try {
    // connect to database
    await connectDatabase()

    // get category
    const category = await CategoryModel.findById(categoryId).lean()

    // return response
    return { category: JSON.parse(JSON.stringify(category)), message: 'Category is here' }
  } catch (err: any) {
    throw new Error(err)
  }
}
