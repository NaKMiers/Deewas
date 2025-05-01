import { createBudget, getBudgets } from '@/app/api/budget'
import { getCategories } from '@/app/api/category'
import moment from 'moment-timezone'
import { z } from 'zod'

// MARK: Get budgets
export const get_budgets = (userId: string, style?: string) => {
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
            return { error: `No category found with name "${categoryName}"` }
          }
        }

        const params: any = {}
        if (category) params.category = [category._id]

        const { budgets }: { budgets: any[] } = await getBudgets(userId, params)
        return { budgets, message }
      } catch (err: any) {
        return { error: 'Failed to get budgets' }
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
      begin: z.date(),
      end: z.date(),
      message: z.string().describe('a short message with your personalities'),
    }),
    execute: async ({
      categoryName,
      total,
      begin,
      end,
      message,
    }: {
      categoryName: string
      total: number
      begin: string
      end: string
      message: string
    }) => {
      try {
        const { categories }: { categories: any[] } = await getCategories(userId)
        const category = categories.find(c => c.name.toLowerCase() === categoryName.toLowerCase())

        if (!category) {
          return { error: `No category found with name "${categoryName}"` }
        }

        const { budget } = await createBudget(
          userId,
          isPremium,
          category._id,
          moment(begin).startOf('day').toDate(),
          moment(end).endOf('day').toDate(),
          total
        )

        return { budget, message }
      } catch (err: any) {
        return { error: 'Failed to create budget' }
      }
    },
  }
}
