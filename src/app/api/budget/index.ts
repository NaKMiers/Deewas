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

type DefaultsType = {
  skip: number
  limit: number
  filter: { [key: string]: any }
  sort: { [key: string]: any }
}

// MARK: Filter Builder
const filterBuilder = (
  params: any,
  defaults: DefaultsType = {
    skip: 0,
    limit: Infinity,
    sort: {},
    filter: {},
  }
) => {
  // options
  let skip = defaults.skip
  let limit = defaults.limit
  const filter: { [key: string]: any } = defaults.filter
  let sort: { [key: string]: any } = defaults.sort

  // build filter
  for (const key in params) {
    const values = params[key]

    if (params.hasOwnProperty(key)) {
      // Special Cases ---------------------
      if (key === 'limit') {
        limit = +values[0]
        continue
      }

      if (key === 'page') {
        // page only works when limit is set
        if (limit === Infinity) {
          continue
        }

        const page = +values[0]
        skip = (page - 1) * limit
        continue
      }

      if (key === 'search') {
        const searchFields = ['name', 'type']

        filter.$or = searchFields.map(field => ({
          [field]: { $regex: values[0], $options: 'i' },
        }))
        continue
      }

      if (key === 'sort') {
        values.forEach((value: string) => {
          sort[value.split('|')[0]] = +value.split('|')[1]
        })

        continue
      }

      if (key === 'amount') {
        const from = +values[0].split('-')[0]
        const to = +values[0].split('-')[1]
        if (from >= 0 && to >= 0) {
          filter[key] = {
            $gte: from,
            $lte: to,
          }
        } else if (from >= 0) {
          filter[key] = {
            $gte: from,
          }
        } else if (to >= 0) {
          filter[key] = {
            $lte: to,
          }
        }
        continue
      }

      if (key === 'begin') {
        filter.date = { ...filter.date, $gte: toUTC(values[0]) }
        continue
      }

      if (key === 'end') {
        filter.date = { ...filter.date, $lte: toUTC(values[0]) }
        continue
      }

      // Normal Cases ---------------------
      filter[key] = values.length === 1 ? values[0] : { $in: values }
    }
  }

  return { filter, sort, limit, skip }
}

// MARK: Delete Budget
export const deleteBudget = async (budgetId: string) => {
  try {
    // connect to database
    await connectDatabase()

    // delete budget
    const budget = await BudgetModel.findByIdAndDelete(budgetId).populate('category').lean()

    // check if budget exists
    if (!budget) {
      throw { errorCode: 'BUDGET_NOT_FOUND', message: 'Budget not found' }
    }

    // return response
    return { budget: JSON.parse(JSON.stringify(budget)), message: 'Deleted budget' }
  } catch (err: any) {
    throw err
  }
}

// MARK: Update Budget
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

// MARK: Create Budget
export const createBudget = async (
  userId: string,
  isPremium: boolean,
  categoryId: string,
  begin: string | Date,
  end: string | Date,
  total: number
) => {
  try {
    // connect to database
    await connectDatabase()

    console.log('create budget', { userId, categoryId, begin, end, total })

    // limit 4 budgets for free user
    if (!isPremium) {
      // count user wallets
      const budgetCount = await BudgetModel.countDocuments({
        user: userId,
        end: { $gte: toUTC(moment().toDate()) },
      }).lean()

      if (budgetCount >= 4) {
        throw {
          errorCode: 'BUDGET_LIMIT_REACHED',
          message:
            'You have reached the limit of budgets. Please upgrade to premium to create unlimited budgets.',
        }
      }
    }

    // check if category is an expense
    const category: any = await CategoryModel.findById(categoryId).select('type').lean()

    if (!category || category.type !== 'expense') {
      throw { errorCode: 'INVALID_CATEGORY', message: 'Category is not an expense category' }
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
      throw { errorCode: 'CREATE_BUDGET_FAILED', message: 'Failed to create budget' }
    }

    return { budget: JSON.parse(JSON.stringify(budget)), message: 'Created budget' }
  } catch (err: any) {
    throw err
  }
}

// MARK: Get Budgets
export const getBudgets = async (userId: string, params: any = {}) => {
  try {
    // connect to database
    await connectDatabase()

    console.log('params', params)

    const { filter, sort, limit, skip } = filterBuilder(params, {
      skip: 0,
      limit: 10,
      filter: { user: userId, end: { $gte: toUTC(moment().toDate()) } },
      sort: { end: 1, createdAt: -1 },
    })

    console.log('filter', filter)
    console.log('sort', sort)
    console.log('limit', limit)
    console.log('skip', skip)

    // get budgets: budgets.end > today
    let budgets = await BudgetModel.find(filter)
      .populate('category')
      .sort(sort)
      .limit(limit)
      .skip(skip)
      .lean()

    return { budgets: JSON.parse(JSON.stringify(budgets)), message: 'Budgets are here' }
  } catch (err: any) {
    throw err
  }
}
