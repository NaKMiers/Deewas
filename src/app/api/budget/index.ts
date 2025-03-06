import { connectDatabase } from '@/config/database'
import { toUTC } from '@/lib/time'
import BudgetModel from '@/models/BudgetModel'
import CategoryModel from '@/models/CategoryModel'
import TransactionModel from '@/models/TransactionModel'
import moment from 'moment-timezone'

// Models: Transaction, Category, Wallet, Budget
import '@/models/BudgetModel'
import '@/models/CategoryModel'
import '@/models/TransactionModel'
import '@/models/WalletModel'

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

export const updateBudget = async (
  budgetId: string,
  categoryId: string,
  begin: string,
  end: string,
  total: number
) => {
  try {
    // connect to database
    await connectDatabase()

    // calculate total amount of transactions of category from begin to end of budget
    const transactions = await TransactionModel.find({
      category: categoryId,
      date: { $gte: toUTC(begin), $lte: toUTC(end) },
    }).lean()
    const totalAmount = transactions.reduce((total, transaction) => total + transaction.amount, 0)

    // update budget
    const budget = await BudgetModel.findByIdAndUpdate(
      budgetId,
      {
        $set: {
          category: categoryId,
          total,
          begin: toUTC(begin),
          end: toUTC(end),
          amount: totalAmount,
        },
      },
      { new: true }
    )
      .populate('category')
      .lean()

    return { budget: JSON.parse(JSON.stringify(budget)), message: 'Updated budget' }
  } catch (err: any) {
    throw new Error(err)
  }
}

export const createBudget = async (
  userId: string,
  categoryId: string,
  begin: string,
  end: string,
  total: number
) => {
  // connect to database
  await connectDatabase()

  // check if category is an expense
  const category: any = await CategoryModel.findById(categoryId).select('type').lean()

  if (!category || category.type !== 'expense') {
    throw new Error('Category is not an expense')
  }

  // calculate total amount of transactions of category from begin to end of budget
  const transactions = await TransactionModel.find({
    category: categoryId,
    date: { $gte: toUTC(begin), $lte: toUTC(end) },
  }).lean()
  const totalAmount = transactions.reduce((total, transaction) => total + transaction.amount, 0)

  // create budget
  const bud = await BudgetModel.create({
    user: userId,
    category: categoryId,
    total,
    begin: toUTC(begin),
    end: toUTC(end),
    amount: totalAmount,
  })

  // get newly created budget
  const budget = await BudgetModel.findById(bud._id).populate('category').lean()

  if (!budget) {
    throw new Error('Failed to create budget')
  }

  return { budget: JSON.parse(JSON.stringify(budget)), message: 'Created budget' }
}

export const getBudgets = async (userId: string, params: any = {}) => {
  try {
    // connect to database
    await connectDatabase()

    console.log('params', params)

    const filter: any = { user: userId, end: { $gte: toUTC(moment().toDate()) } }
    Object.keys(params).forEach(key => {
      if (params[key]) {
        filter[key] = params[key]
      }
    })

    console.log('filter', filter)

    // get budgets: budgets.end > today
    const budgets = await BudgetModel.find(filter).populate('category').lean()

    return { budgets: JSON.parse(JSON.stringify(budgets)), message: 'Budgets are here' }
  } catch (err: any) {
    throw new Error(err.message)
  }
}
