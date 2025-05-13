import { connectDatabase } from '@/config/database'
import { NextRequest, NextResponse } from 'next/server'

// [TEST]: /test
export async function GET(req: NextRequest) {
  console.log('Test API')

  try {
    // connect to database
    await connectDatabase()

    // // async amount of all categories
    // const categories = await CategoryModel.find().lean()

    // for (const category of categories) {
    //   const transactions = await TransactionModel.find({ category: category._id, exclude: false })
    //     .select('amount')
    //     .lean()
    //   const totalAmount = transactions.reduce((acc, transaction) => acc + transaction.amount, 0)

    //   // update category with total amount
    //   await CategoryModel.findByIdAndUpdate(category._id, { $set: { amount: totalAmount } })
    // }

    // return response
    return NextResponse.json({ message: '' }, { status: 200 })
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 })
  }
}
