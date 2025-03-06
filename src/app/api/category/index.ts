import { connectDatabase } from '@/config/database'
import CategoryModel, { ICategory } from '@/models/CategoryModel'
import TransactionModel from '@/models/TransactionModel'

// Models: Transaction, Category, Wallet, Budget
import '@/models/BudgetModel'
import '@/models/CategoryModel'
import '@/models/TransactionModel'
import '@/models/WalletModel'

export const deleteCategory = async (userId: string, categoryId: string) => {
  // connect to database
  await connectDatabase()

  // find category
  let category: any = await CategoryModel.findById(categoryId).lean()

  // check if category exists
  if (!category) {
    throw new Error('Category not found')
  }

  // check if category is deletable
  if (category.deletable === false) {
    throw new Error('Cannot delete default category')
  }

  // get uncategorized category of this type
  const uncategorizedCategory = await CategoryModel.findOne({
    user: userId,
    type: category.type,
    deletable: false,
  }).select('_id')

  if (!uncategorizedCategory) {
    throw new Error('Failed to delete category')
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
  ])

  return {
    category: JSON.parse(JSON.stringify(category)),
    message: `Deleted ${category.icon} ${category.name} category`,
  }
}

export const updateCategory = async (categoryId: string, name: string, icon: string) => {
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
    throw new Error('Category not found')
  }

  return { category: JSON.parse(JSON.stringify(category)), message: 'Updated category' }
}

export const getCategory = async (categoryId: string) => {
  try {
    // connect to database
    await connectDatabase()

    // get category
    const category = await CategoryModel.findById(categoryId).lean()

    // return response
    return { category: JSON.parse(JSON.stringify(category)), message: 'Category is here' }
  } catch (err: any) {
    throw new Error(err)
  }
}

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

export const getCategories = async (userId: string, params: any = {}) => {
  try {
    // connect to database
    await connectDatabase()

    const filter: any = { user: userId }
    Object.keys(params).forEach(key => {
      if (params[key]) {
        filter[key] = params[key]
      }
    })

    // get user categories
    const categories = await CategoryModel.find(filter).lean()

    return { categories: JSON.parse(JSON.stringify(categories)), message: 'Categories are here' }
  } catch (err: any) {
    throw new Error(err)
  }
}
