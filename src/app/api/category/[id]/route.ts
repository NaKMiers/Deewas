import { NextRequest, NextResponse } from 'next/server'
import { getCategory } from '..'

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
