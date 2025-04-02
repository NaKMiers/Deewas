import { extractToken } from '@/lib/utils'
import { NextRequest, NextResponse } from 'next/server'
import { getTransactions } from '..'

// [GET]: /transaction/:id
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  console.log('- Get Transaction - ')

  try {
    const token = await extractToken(req)
    const userId = token?._id as string

    if (!userId) {
      return NextResponse.json({ message: 'Please login to continue' }, { status: 401 })
    }

    // get transaction id
    const { id } = await params

    const response = await getTransactions(id)

    // return response
    return NextResponse.json(response, { status: 200 })
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 })
  }
}
