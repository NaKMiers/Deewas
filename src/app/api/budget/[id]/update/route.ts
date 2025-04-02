import { extractToken } from '@/lib/utils'
import { NextRequest, NextResponse } from 'next/server'
import { updateBudget } from '../..'

// [PUT]: /budget/:id/update
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  console.log('- Update Budget -')

  try {
    const token = await extractToken(req)
    const userId = token?._id

    // check if user is logged
    if (!userId) {
      return NextResponse.json({ message: 'Please login to continue' }, { status: 401 })
    }

    // get budget id from params
    const { id } = await params

    // get data from request body
    const { categoryId, total, begin, end } = await req.json()

    const response = await updateBudget(id, categoryId, begin, end, total)

    // return response
    return NextResponse.json(response, { status: 200 })
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 })
  }
}
