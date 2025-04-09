import { createBudget, getBudgets } from '@/app/api/budget'
import { getCategories } from '@/app/api/category'
import moment from 'moment-timezone'
import { z } from 'zod'

// MARK: Get budgets
export const get_budgets = (userId: string) => {
  return {
    description: 'get budgets by category name',
    parameters: z.object({
      categoryName: z.string().optional(),
    }),
    execute: async ({ categoryName }: { categoryName?: string }) => {
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
        return { budgets }
      } catch (err: any) {
        return { error: `Failed to get budgets: ${err.message}` }
      }
    },
  }
}

// MARK: Create budget
export const create_budget = (userId: string) => {
  return {
    description:
      'create a budget with the following properties: category name, total, begin of budget, end of budget',
    parameters: z.object({
      categoryName: z.string(),
      total: z.number(),
      begin: z.string(),
      end: z.string(),
    }),
    execute: async ({
      categoryName,
      total,
      begin,
      end,
    }: {
      categoryName: string
      total: number
      begin: string
      end: string
    }) => {
      try {
        const { categories }: { categories: any[] } = await getCategories(userId)
        const category = categories.find(c => c.name.toLowerCase() === categoryName.toLowerCase())

        if (!category) {
          return { error: `No category found with name "${categoryName}"` }
        }

        const { budget } = await createBudget(
          userId,
          category._id,
          moment(begin).startOf('day').toDate(),
          moment(end).endOf('day').toDate(),
          total
        )

        return { budget }
      } catch (err: any) {
        return { error: `Failed to create budget: ${err.message}` }
      }
    },
  }
}
