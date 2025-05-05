import { extractToken } from '@/lib/utils'
import { NextRequest, NextResponse } from 'next/server'
import { updateTransaction } from '../..'

// [PUT]: /transaction/:id/update
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  console.log('- Update Transaction - ')

  try {
    const token = await extractToken(req)
    const userId = token?._id

    // check if user is logged in
    if (!userId) {
      return NextResponse.json({ message: 'Please login to continue' }, { status: 401 })
    }

    // get transaction id to update
    const { id } = await params

    // get data from request
    const { name, amount, date, walletId, categoryId } = await req.json()

    const response = await updateTransaction(id, walletId, categoryId, name, amount, date)

    // return response
    return NextResponse.json(response, { status: 200 })
  } catch (err: any) {
    return NextResponse.json({ message: err.message || err.error }, { status: 500 })
  }
}
