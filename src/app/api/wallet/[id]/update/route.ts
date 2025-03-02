import { connectDatabase } from '@/config/database'
import WalletModel from '@/models/WalletModel'
import { getToken } from 'next-auth/jwt'
import { NextRequest, NextResponse } from 'next/server'

// Models: Wallet
import '@/models/WalletModel'

// [PUT]: /wallet/:id/update
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  console.log('- Update Wallet -')

  try {
    // connect to database
    await connectDatabase()

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
    console.log('hide', hide)

    // update wallet
    const wallet = await WalletModel.findByIdAndUpdate(
      id,
      { $set: { name, icon, hide } },
      { new: true }
    ).lean()

    // return response
    return NextResponse.json({ wallet, message: 'Updated wallet' }, { status: 200 })
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 })
  }
}
