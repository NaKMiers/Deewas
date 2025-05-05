import { createBudget, deleteBudget, getBudgets, updateBudget } from '@/app/api/budget'
import { getCategories } from '@/app/api/category'
import { IFullBudget } from '@/models/BudgetModel'
import moment from 'moment-timezone'
import { z } from 'zod'

// MARK: Get all budgets
export const get_all_budgets = (userId: string, style?: string) => {
  return {
    description: 'get budgets by category name',
    parameters: z.object({
      categoryName: z.string().optional(),
      message: z.string().describe('a short message with your personalities'),
    }),
    execute: async ({ categoryName, message }: { categoryName?: string; message: string }) => {
      try {
        let category = null
        if (categoryName) {
          const { categories }: { categories: any[] } = await getCategories(userId)
          category = categories.find(c => c.name.toLowerCase() === categoryName.toLowerCase())

          if (!category) {
            throw {
              errorCode: 'CATEGORY_NOT_FOUND',
              message: `No category found with name "${categoryName}"`,
            }
          }
        }

        const params: any = {}
        if (category) params.category = [category._id]

        const { budgets }: { budgets: any[] } = await getBudgets(userId, params)
        return { budgets, message }
      } catch (err: any) {
        const code = err.errorCode
        return {
          errorCode: code || '',
          error: code ? err.message : 'Failed to get budgets',
        }
      }
    },
  }
}

// MARK: Create budget
export const create_budget = (userId: string, isPremium: boolean, style?: string) => {
  return {
    description:
      'create a budget with the following properties: category name, total, begin of budget, end of budget',
    parameters: z.object({
      categoryName: z.string(),
      total: z.number(),
      beginDate: z.string(),
      endDate: z.string(),
      message: z.string().describe('a short message with your personalities'),
    }),
    execute: async ({
      categoryName,
      total,
      beginDate,
      endDate,
      message,
    }: {
      categoryName: string
      total: number
      beginDate: string
      endDate: string
      message: string
    }) => {
      try {
        const { categories }: { categories: any[] } = await getCategories(userId, { type: ['expense'] })
        const category = categories.find(c => c.name.toLowerCase() === categoryName.toLowerCase())

        if (!category) {
          throw {
            errorCode: 'INVALID_CATEGORY',
            message: `No category found with name "${categoryName}"`,
          }
        }

        const { budget } = await createBudget(
          userId,
          isPremium,
          category._id,
          moment(beginDate).startOf('day').toDate(),
          moment(endDate).endOf('day').toDate(),
          total
        )

        return {
          budget,
          message,
        }
      } catch (err: any) {
        const code = err.errorCode
        return {
          errorCode: code || '',
          error: code ? err.message : 'Failed to create budget',
        }
      }
    },
  }
}

// MARK: Update budget
export const update_budget = (userId: string, style?: string) => {
  return {
    description:
      'update a budget with the following properties: category name, total, begin date, end date',
    parameters: z.object({
      categoryName: z.string(),
      total: z.number(),
      beginDate: z.string().optional(),
      endDate: z.string().optional(),

      newCategoryName: z.string().optional(),
      newTotal: z.number().optional(),
      newBeginDate: z.string().optional(),
      newEndDate: z.string().optional(),

      message: z.string().describe('a short message with your personalities'),
    }),
    execute: async ({
      categoryName,
      total,
      beginDate,
      endDate,
      message,
    }: {
      categoryName: string
      total: number
      beginDate: string
      endDate: string
      message: string
    }) => {
      try {
        const { categories }: { categories: any[] } = await getCategories(userId, { type: ['expense'] })
        const category = categories.find(c => c.name.toLowerCase() === categoryName.toLowerCase())

        if (!category) {
          throw {
            errorCode: 'INVALID_CATEGORY',
            message: `No category found with name "${categoryName}"`,
          }
        }

        const { budgets }: { budgets: IFullBudget[] } = await getBudgets(userId)
        let budget = budgets.find(b => b.category._id === category._id)

        if (!budget) {
          throw {
            errorCode: 'INVALID_BUDGET',
            message: `No budget found for category "${categoryName}"`,
          }
        }

        if (beginDate && endDate) {
          budget = budgets.find(
            b => moment(b.begin).isSame(beginDate, 'day') && moment(b.end).isSame(endDate, 'day')
          )
          if (!budget) {
            throw {
              errorCode: 'INVALID_BUDGET',
              message: `No budget found with begin date "${beginDate}" and end date "${endDate}"`,
            }
          }
        } else if (beginDate) {
          budget = budgets.find(b => moment(b.begin).isSame(beginDate, 'day'))
          if (!budget) {
            throw {
              errorCode: 'INVALID_BUDGET',
              message: `No budget found with begin date "${beginDate}"`,
            }
          }
        } else if (endDate) {
          budget = budgets.find(b => moment(b.end).isSame(endDate, 'day'))
          if (!budget) {
            throw {
              errorCode: 'INVALID_BUDGET',
              message: `No budget found with end date "${endDate}"`,
            }
          }
        }

        const { budget: updatedBudget } = await updateBudget(
          budget._id,
          category._id,
          beginDate,
          endDate,
          total
        )

        return {
          budget: updatedBudget,
          message,
        }
      } catch (err: any) {
        const code = err.errorCode
        return {
          errorCode: code || '',
          error: code ? err.message : 'Failed to create budget',
        }
      }
    },
  }
}

// MARK: Delete budget
export const delete_budget = (userId: string, style?: string) => {
  return {
    description:
      'delete a budget with the following properties: category name, total, begin date, end date',
    parameters: z.object({
      categoryName: z.string(),
      total: z.number(),
      beginDate: z.string().optional(),
      endDate: z.string().optional(),
      message: z.string().describe('a short message with your personalities'),
    }),
    execute: async ({
      categoryName,
      total,
      beginDate,
      endDate,
      message,
    }: {
      categoryName: string
      total: number
      beginDate: string
      endDate: string
      message: string
    }) => {
      try {
        const { categories }: { categories: any[] } = await getCategories(userId, { type: ['expense'] })
        const category = categories.find(c => c.name.toLowerCase() === categoryName.toLowerCase())

        if (!category) {
          throw {
            errorCode: 'INVALID_CATEGORY',
            message: `No category found with name "${categoryName}"`,
          }
        }

        const { budgets }: { budgets: IFullBudget[] } = await getBudgets(userId)
        let budget = budgets.find(b => b.category._id === category._id)

        if (!budget) {
          throw {
            errorCode: 'INVALID_BUDGET',
            message: `No budget found for category "${categoryName}"`,
          }
        }

        budget = budgets.find(b => b.total === total)
        if (!budget) {
          throw {
            errorCode: 'INVALID_BUDGET',
            message: `No budget found with total "${total}"`,
          }
        }

        if (beginDate && endDate) {
          budget = budgets.find(
            b => moment(b.begin).isSame(beginDate, 'day') && moment(b.end).isSame(endDate, 'day')
          )
          if (!budget) {
            throw {
              errorCode: 'INVALID_BUDGET',
              message: `No budget found with begin date "${beginDate}" and end date "${endDate}"`,
            }
          }
        } else if (beginDate) {
          budget = budgets.find(b => moment(b.begin).isSame(beginDate, 'day'))
          if (!budget) {
            throw {
              errorCode: 'INVALID_BUDGET',
              message: `No budget found with begin date "${beginDate}"`,
            }
          }
        } else if (endDate) {
          budget = budgets.find(b => moment(b.end).isSame(endDate, 'day'))
          if (!budget) {
            throw {
              errorCode: 'INVALID_BUDGET',
              message: `No budget found with end date "${endDate}"`,
            }
          }
        }

        const { budget: deletedBudget } = await deleteBudget(budget._id)

        return {
          budget: deletedBudget,
          message,
        }
      } catch (err: any) {
        const code = err.errorCode
        return {
          errorCode: code || '',
          error: code ? err.message : 'Failed to create budget',
        }
      }
    },
  }
}
