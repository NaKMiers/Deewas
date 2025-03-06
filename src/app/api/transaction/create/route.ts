import { getToken } from 'next-auth/jwt'
import { NextRequest, NextResponse } from 'next/server'
import { createTransaction } from '..'

// [POST]: /transaction/create
export async function POST(req: NextRequest) {
  console.log('- Create Transaction - ')

  try {
    const token = await getToken({ req })
    const userId = token?._id as string

    // check if user is logged in
    if (!userId) {
      return NextResponse.json({ message: 'Please login to continue' }, { status: 401 })
    }

    // get data from request
    const { walletId, categoryId, name, amount, date, type } = await req.json()

    const response = await createTransaction(userId, walletId, categoryId, name, amount, date, type)

    // return response
    return NextResponse.json(response, { status: 200 })
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 })
  }
}
