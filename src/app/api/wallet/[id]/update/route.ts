import { getToken } from 'next-auth/jwt'
import { NextRequest, NextResponse } from 'next/server'
import { updateWallet } from '../..'

// [PUT]: /wallet/:id/update
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  console.log('- Update Wallet -')

  try {
    const token = await getToken({ req })
    const userId = token?._id

    // check if user is logged in
    if (!userId) {
      return NextResponse.json({ message: 'Please login to continue' }, { status: 401 })
    }

    // get wallet id from request params
    const { id } = await params

    // get data from request body
    const { name, icon, hide } = await req.json()

    const response = await updateWallet(id, name, icon, hide)

    // return response
    return NextResponse.json(response, { status: 200 })
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 })
  }
}
