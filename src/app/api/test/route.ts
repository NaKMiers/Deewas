import { connectDatabase } from '@/config/database'
import CategoryModel from '@/models/CategoryModel'
import TransactionModel from '@/models/TransactionModel'
import { NextRequest, NextResponse } from 'next/server'

// [GET]: /test
export async function GET(req: NextRequest) {
  console.log('Test API')

  try {
    // connect to database
    await connectDatabase()

    const allCates = await CategoryModel.find().lean()

    for (const cate of allCates) {
      const transactions = await TransactionModel.find({
        category: cate._id,
      })
        .select('amount')
        .lean()
      const amount = transactions.reduce((acc, transaction) => acc + transaction.amount, 0)

      await CategoryModel.updateOne({ _id: cate._id }, { $set: { amount } })
    }

    // return response
    return NextResponse.json({ message: allCates.length }, { status: 200 })
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 })
  }
}
