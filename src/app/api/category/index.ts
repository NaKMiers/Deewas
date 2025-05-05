import { connectDatabase } from '@/config/database'
import BudgetModel from '@/models/BudgetModel'
import CategoryModel, { ICategory } from '@/models/CategoryModel'
import TransactionModel from '@/models/TransactionModel'

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
        const searchFields = ['name', 'icon', 'type']

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

      // Normal Cases ---------------------
      filter[key] = values.length === 1 ? values[0] : { $in: values }
    }
  }

  return { filter, sort, limit, skip }
}

// MARK: Delete Category
export const deleteCategory = async (userId: string, categoryId: string) => {
  try {
    // connect to database
    await connectDatabase()

    // find category
    let category: any = await CategoryModel.findById(categoryId).lean()

    // check if category exists
    if (!category) {
      throw { errorCode: 'CATEGORY_NOT_FOUND', message: 'Category not found' }
    }

    // check if category is deletable
    if (category.deletable === false) {
      throw { errorCode: 'CATEGORY_NOT_DELETABLE', message: 'Category not deletable' }
    }

    // get uncategorized category of this type
    const uncategorizedCategory = await CategoryModel.findOne({
      user: userId,
      type: category.type,
      deletable: false,
    }).select('_id')

    if (!uncategorizedCategory) {
      throw { errorCode: 'CATEGORY_DELETE_FAILED', message: 'Failed to delete category' }
    }

    await Promise.all([
      // delete category
      CategoryModel.findByIdAndDelete(categoryId),
      // move all transactions to uncategorized category
      TransactionModel.updateMany(
        { user: userId, category: categoryId },
        { $set: { category: uncategorizedCategory._id } }
      ),
      // update total amount of uncategorized category
      CategoryModel.findByIdAndUpdate(uncategorizedCategory._id, {
        $inc: { amount: category.amount },
      }),
      // delete all budgets of this category
      BudgetModel.deleteMany({ user: userId, category: categoryId }),
    ])

    return {
      category: JSON.parse(JSON.stringify(category)),
      message: `Deleted ${category.icon} ${category.name} category`,
    }
  } catch (err: any) {
    throw err
  }
}

// MARK: Update Category
export const updateCategory = async (categoryId: string, name: string, icon: string) => {
  try {
    // connect to database
    await connectDatabase()

    // update category
    const category: ICategory | null = (await CategoryModel.findByIdAndUpdate(
      categoryId,
      { $set: { name, icon } },
      { new: true }
    ).lean()) as any

    // check if category exists
    if (!category) {
      throw { errorCode: 'CATEGORY_NOT_FOUND', message: 'Category not found' }
    }

    return { category: JSON.parse(JSON.stringify(category)), message: 'Updated category' }
  } catch (err: any) {
    return err
  }
}

// MARK: Create Category
export const createCategory = async (userId: string, name: string, icon: string, type: string) => {
  try {
    // connect to database
    await connectDatabase()

    // create category
    const category = await CategoryModel.create({
      user: userId,
      name,
      icon,
      type,
    })

    return { category: JSON.parse(JSON.stringify(category)), message: 'Created category' }
  } catch (err: any) {
    return err
  }
}

// MARK: Get Category
export const getCategory = async (categoryId: string) => {
  try {
    // connect to database
    await connectDatabase()

    // get category
    const category = await CategoryModel.findById(categoryId).lean()

    // return response
    return { category: JSON.parse(JSON.stringify(category)), message: 'Category is here' }
  } catch (err: any) {
    throw err
  }
}

// MARK: Get Categories
export const getCategories = async (userId: string, params: any = {}) => {
  try {
    // connect to database
    await connectDatabase()

    console.log('params', params)

    const { filter, sort, limit, skip } = filterBuilder(params, {
      skip: 0,
      filter: { user: userId },
      sort: { createdAt: -1 },
      limit: Infinity,
    })

    console.log('filter', filter)
    console.log('sort', sort)
    console.log('limit', limit)
    console.log('skip', skip)

    // get user categories
    const categories = await CategoryModel.find(filter).sort(sort).skip(skip).limit(limit).lean()

    return { categories: JSON.parse(JSON.stringify(categories)), message: 'Categories are here' }
  } catch (err: any) {
    throw err
  }
}
