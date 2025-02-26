import { connectDatabase } from '@/config/database'
import WalletModel from '@/models/WalletModel'
import { getToken } from 'next-auth/jwt'
import { NextRequest, NextResponse } from 'next/server'

// Models:
import '@/models/CategoryModel'
import CategoryModel from '@/models/CategoryModel'
import '@/models/WalletModel'

// [GET]: /wallet/:id
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  console.log('- Get Wallet -')

  try {
    // connect to database
    await connectDatabase()

    const token = await getToken({ req })
    const userId = token?._id

    // check if user is logged in
    if (!userId) {
      return NextResponse.json({ message: 'Please login to continue' }, { status: 401 })
    }

    // get wallet id from params
    const { id } = await params

    // find wallet
    const wallet = await WalletModel.findOne({ _id: id, user: userId, deleted: false }).lean()
    const categories = await CategoryModel.find({ wallet: id, deleted: false, user: userId }).lean()

    // check if wallet exist
    if (!wallet) {
      return NextResponse.json({ message: 'Wallet not found' }, { status: 404 })
    }

    // return response
    return NextResponse.json({ wallet, categories, message: 'Wallet is here' }, { status: 200 })
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 })
  }
}
