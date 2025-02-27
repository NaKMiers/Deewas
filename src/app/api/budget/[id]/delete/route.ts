import { connectDatabase } from '@/config/database'
import { toUTC } from '@/lib/time'
import BudgetModel from '@/models/BudgetModel'
import TransactionModel from '@/models/TransactionModel'
import { getToken } from 'next-auth/jwt'
import { NextRequest, NextResponse } from 'next/server'

// Models: Budget, Transaction
import '@/models/BudgetModel'
import '@/models/TransactionModel'

// [DELETE]: /budget/:id/delete
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  console.log('- Delete Budget -')

  try {
    // connect to database
    await connectDatabase()

    const token = await getToken({ req })
    const userId = token?._id

    // check if user is logged
    if (!userId) {
      return NextResponse.json({ message: 'Please login to continue' }, { status: 401 })
    }

    // get budget id from params
    const { id } = await params

    // return response
    return NextResponse.json({ message: 'updated budget' }, { status: 200 })
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 })
  }
}
