import { connectDatabase } from '@/config/database'
import CategoryModel from '@/models/CategoryModel'
import WalletModel from '@/models/WalletModel'
import { getToken } from 'next-auth/jwt'
import { NextRequest, NextResponse } from 'next/server'

// Models: Wallet, Category
import '@/models/CategoryModel'
import '@/models/WalletModel'

export const dynamic = 'force-dynamic'

// [GET]: /wallet/:id
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  console.log('- Get Wallet -')

  try {
    const token = await getToken({ req })
    const userId = token?._id as string

    // check if user is logged in
    if (!userId) {
      return NextResponse.json({ message: 'Please login to continue' }, { status: 401 })
    }

    // get wallet id from params
    const { id } = await params

    const response = await getWallet(id, userId)

    // return response
    return NextResponse.json(response, { status: 200 })
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 })
  }
}

export const getWallet = async (walletId: string, userId: string) => {
  try {
    // connect to database
    await connectDatabase()

    // find wallet
    const wallet = await WalletModel.findById(walletId).lean()
    const categories = await CategoryModel.find({ wallet: walletId, user: userId }).lean()

    // check if wallet exist
    if (!wallet) {
      throw new Error('Wallet not found')
    }

    return {
      wallet: JSON.parse(JSON.stringify(wallet)),
      categories: JSON.parse(JSON.stringify(categories)),
      message: 'Wallet is here',
    }
  } catch (err: any) {
    throw new Error(err)
  }
}
