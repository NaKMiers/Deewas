import { createCategory, deleteCategory, getCategories } from '@/app/api/category'
import { updateCategory } from '@/app/api/category/'
import { Message } from '@/components/ai/message'
import Category from '@/components/Category'
import { CoreMessage, generateId } from 'ai'
import { getMutableAIState } from 'ai/rsc'
import { z } from 'zod'

// MARK: Get all categories
export const get_all_categories = (userId: string) => {
  const messages = getMutableAIState('messages')

  return {
    description: 'get all categories of the user',
    parameters: z.object({
      type: z.enum(['income', 'expense', 'transfer', 'saving', 'invest']).optional(),
    }),
    generate: async function* ({ type }: { type?: string }) {
      const toolCallId = generateId()

      try {
        const params: any = {}
        if (type) params.type = type
        const { categories }: { categories: any[] } = await getCategories(userId, params)

        messages.done([
          ...(messages.get() as CoreMessage[]),
          {
            role: 'assistant',
            content: [
              {
                type: 'tool-call',
                toolCallId,
                toolName: 'get_all_categories',
                args: { type },
              },
            ],
          },
          {
            role: 'tool',
            content: [
              {
                type: 'tool-result',
                toolName: 'get_all_categories',
                toolCallId,
                result: `Categories are shown on the screen`,
              },
            ],
          },
        ])

        return (
          <Message
            role="assistant"
            content={
              <div className="flex flex-col gap-1.5">
                {categories.map(c => (
                  <Category
                    key={c._id}
                    category={c}
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

// MARK: Get category
export const get_category = (userId: string) => {
  const messages = getMutableAIState('messages')

  return {
    description: 'get category by name',
    parameters: z.object({
      name: z.string(),
      type: z.enum(['income', 'expense', 'transfer', 'saving', 'invest']).optional(),
    }),
    generate: async function* ({ name, type }: { name: string; type?: string }) {
      const toolCallId = generateId()

      try {
        const params: any = {}
        if (type) params.type = [type]
        const { categories }: { categories: any[] } = await getCategories(userId, params)

        const category = categories.find(c => c.name.toLowerCase() === name.toLowerCase())

        if (!category) {
          return (
            <Message
              role="assistant"
              content={`❌ No category found with name "${name}"`}
            />
          )
        }

        messages.done([
          ...(messages.get() as CoreMessage[]),
          {
            role: 'assistant',
            content: [
              {
                type: 'tool-call',
                toolCallId,
                toolName: 'get_category',
                args: { name },
              },
            ],
          },
          {
            role: 'tool',
            content: [
              {
                type: 'tool-result',
                toolName: 'get_category',
                toolCallId,
                result: `category is shown on the screen`,
              },
            ],
          },
        ])

        return (
          <Message
            role="assistant"
            content={<Category category={category} />}
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

// MARK: Create category
export const create_category = (userId: string) => {
  const messages = getMutableAIState('messages')

  return {
    description: 'create a category with the following properties: name, icon, type',
    parameters: z.object({
      name: z.string(),
      icon: z.string(),
      type: z.enum(['income', 'expense', 'transfer', 'saving', 'invest']),
    }),
    generate: async function* ({ name, icon, type }: { name: string; icon: string; type: string }) {
      const toolCallId = generateId()

      try {
        const { category } = await createCategory(userId, name, icon, type)

        messages.done([
          ...(messages.get() as CoreMessage[]),
          {
            role: 'assistant',
            content: [
              {
                type: 'tool-call',
                toolCallId,
                toolName: 'create_category',
                args: { name, icon },
              },
            ],
          },
          {
            role: 'tool',
            content: [
              {
                type: 'tool-result',
                toolName: 'create_category',
                toolCallId,
                result: `The category has been created and shown on the screen`,
              },
            ],
          },
        ])

        return (
          <Message
            role="assistant"
            content={<Category category={category} />}
          />
        )
      } catch (err: any) {
        return (
          <Message
            role="assistant"
            content={`❌ Failed to create category: ${err.message}`}
          />
        )
      }
    },
  }
}

// MARK: Update category
export const update_category = (userId: string) => {
  const messages = getMutableAIState('messages')

  return {
    description: 'update category by name',
    parameters: z.object({
      name: z.string(),
      newName: z.string(),
      icon: z.string(),
    }),
    generate: async function* ({
      name,
      newName,
      icon,
    }: {
      name: string
      newName: string
      icon: string
    }) {
      const toolCallId = generateId()

      try {
        const { categories }: { categories: any[] } = await getCategories(userId)

        const categoryToUpdate: any = categories.find(c => c.name.toLowerCase() === name.toLowerCase())

        if (!categoryToUpdate) {
          return (
            <Message
              role="assistant"
              content={`❌ No category found with name "${name}"`}
            />
          )
        }

        const { category } = await updateCategory(categoryToUpdate._id, newName, icon)

        messages.done([
          ...(messages.get() as CoreMessage[]),
          {
            role: 'assistant',
            content: [
              {
                type: 'tool-call',
                toolCallId,
                toolName: 'update_category',
                args: { name, icon },
              },
            ],
          },
          {
            role: 'tool',
            content: [
              {
                type: 'tool-result',
                toolName: 'update_category',
                toolCallId,
                result: `The category has been updated and shown on the screen`,
              },
            ],
          },
        ])

        return (
          <Message
            role="assistant"
            content={<Category category={category} />}
          />
        )
      } catch (err: any) {
        return (
          <Message
            role="assistant"
            content={`❌ Failed to create category: ${err.message}`}
          />
        )
      }
    },
  }
}

// MARK: Delete category
export const delete_category = (userId: string) => {
  const messages = getMutableAIState('messages')

  return {
    description: 'delete a category by name',
    parameters: z.object({
      name: z.string(),
    }),
    generate: async function* ({ name }: { name: string }) {
      const toolCallId = generateId()

      try {
        const { categories }: { categories: any[] } = await getCategories(userId)

        const categoryToDelete = categories.find(c => c.name.toLowerCase() === name.toLowerCase())

        if (!categoryToDelete) {
          return (
            <Message
              role="assistant"
              content={`❌ No category found with name "${name}"`}
            />
          )
        }

        const { category } = await deleteCategory(userId, categoryToDelete._id)

        messages.done([
          ...(messages.get() as CoreMessage[]),
          {
            role: 'assistant',
            content: [
              {
                type: 'tool-call',
                toolCallId,
                toolName: 'delete_category',
                args: { name },
              },
            ],
          },
          {
            role: 'tool',
            content: [
              {
                type: 'tool-result',
                toolName: 'delete_category',
                toolCallId,
                result: `Category "${category.name}" has been deleted.`,
              },
            ],
          },
        ])

        return (
          <Message
            role="assistant"
            content={`Category "${category.name}" has been deleted.`}
          />
        )
      } catch (err: any) {
        return (
          <Message
            role="assistant"
            content={`❌ Failed to delete category: ${err.message}`}
          />
        )
      }
    },
  }
}
