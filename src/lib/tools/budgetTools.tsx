import { createBudget, getBudgets } from '@/app/api/budget'
import { getCategories } from '@/app/api/category'
import { Message } from '@/components/ai/message'
import BudgetCard from '@/components/BudgetCard'
import { IFullBudget } from '@/models/BudgetModel'
import { CoreMessage, generateId } from 'ai'
import { getMutableAIState } from 'ai/rsc'
import moment from 'moment-timezone'
import { z } from 'zod'

// MARK: Get budgets
export const get_budgets = (userId: string) => {
  const messages = getMutableAIState('messages')

  return {
    description: 'get budgets by category name',
    parameters: z.object({
      categoryName: z.string().optional(),
    }),
    generate: async function* ({ categoryName }: { categoryName?: string }) {
      const toolCallId = generateId()

      try {
        let category = null
        if (categoryName) {
          const { categories }: { categories: any[] } = await getCategories(userId)

          category = categories.find(c => c.name.toLowerCase() === categoryName.toLowerCase())

          if (!category) {
            return (
              <Message
                role="assistant"
                content={`❌ No category found with name "${categoryName}"`}
              />
            )
          }
        }

        const params: any = {}
        if (category) params.category = [category._id]

        const { budgets }: { budgets: any[] } = await getBudgets(userId, params)

        messages.done([
          ...(messages.get() as CoreMessage[]),
          {
            role: 'assistant',
            content: [
              {
                type: 'tool-call',
                toolCallId,
                toolName: 'get_budgets',
                args: { categoryName },
              },
            ],
          },
          {
            role: 'tool',
            content: [
              {
                type: 'tool-result',
                toolName: 'get_budgets',
                toolCallId,
                result: `budgets shown on the screen`,
              },
            ],
          },
        ])

        return (
          <Message
            role="assistant"
            content={
              <div className="flex flex-col gap-1.5">
                {budgets.map(budget => (
                  <BudgetCard
                    key={budget._id}
                    begin={budget.begin}
                    end={budget.end}
                    budget={budget as IFullBudget}
                  />
                ))}
              </div>
            }
          />
        )
      } catch (err: any) {
        return (
          <Message
            role="assistant"
            content={`❌ Failed to get category: ${err.message}`}
          />
        )
      }
    },
  }
}

// MARK: Create budget
export const create_budget = (userId: string) => {
  const messages = getMutableAIState('messages')

  return {
    description:
      'create a budget with the following properties: category name, total, begin of budget, end of budget',
    parameters: z.object({
      categoryName: z.string(),
      total: z.number(),
      begin: z.string(),
      end: z.string(),
    }),
    generate: async function* ({
      categoryName,
      total,
      begin,
      end,
    }: {
      categoryName: string
      total: number
      begin: string
      end: string
    }) {
      const toolCallId = generateId()

      try {
        const { categories }: { categories: any[] } = await getCategories(userId)

        const category = categories.find(c => c.name.toLowerCase() === categoryName.toLowerCase())

        if (!category) {
          return (
            <Message
              role="assistant"
              content={`❌ No category found with name "${name}"`}
            />
          )
        }

        const { budget } = await createBudget(
          userId,
          category._id,
          moment(begin).startOf('day').toDate(),
          moment(end).endOf('day').toDate(),
          total
        )

        messages.done([
          ...(messages.get() as CoreMessage[]),
          {
            role: 'assistant',
            content: [
              {
                type: 'tool-call',
                toolCallId,
                toolName: 'create_budget',
                args: { categoryName },
              },
            ],
          },
          {
            role: 'tool',
            content: [
              {
                type: 'tool-result',
                toolName: 'create_budget',
                toolCallId,
                result: `budget has been created and shown on the screen`,
              },
            ],
          },
        ])

        return (
          <Message
            role="assistant"
            content={
              <BudgetCard
                begin={budget.begin}
                end={budget.end}
                budget={budget as IFullBudget}
              />
            }
          />
        )
      } catch (err: any) {
        return (
          <Message
            role="assistant"
            content={`❌ Failed to get category: ${err.message}`}
          />
        )
      }
    },
  }
}
