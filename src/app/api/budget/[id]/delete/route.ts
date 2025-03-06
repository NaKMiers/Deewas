import { connectDatabase } from '@/config/database'
import BudgetModel from '@/models/BudgetModel'
import { getToken } from 'next-auth/jwt'
import { NextRequest, NextResponse } from 'next/server'

// Models: Budget, Transaction
import '@/models/BudgetModel'

// [DELETE]: /budget/:id/delete
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  console.log('- Delete Budget -')

  try {
    const token = await getToken({ req })
    const userId = token?._id

    // check if user is logged
    if (!userId) {
      return NextResponse.json({ message: 'Please login to continue' }, { status: 401 })
    }

    // get budget id from params
    const { id } = await params

    const response = await deleteBudget(id)

    // return response
    return NextResponse.json(response, { status: 200 })
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 })
  }
}

export const deleteBudget = async (budgetId: string) => {
  try {
    // connect to database
    await connectDatabase()

    // delete budget
    const budget = await BudgetModel.findByIdAndDelete(budgetId)

    // check if budget exists
    if (!budget) {
      throw new Error('Budget not found')
    }

    // return response
    return { budget: JSON.parse(JSON.stringify(budget)), message: 'Deleted budget' }
  } catch (err: any) {
    throw new Error(err)
  }
}
