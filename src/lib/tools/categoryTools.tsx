import { createCategory, deleteCategory, getCategories } from '@/app/api/category'
import { updateCategory } from '@/app/api/category/'
import { z } from 'zod'

// MARK: Get all categories
export const get_all_categories = (userId: string, style?: string) => {
  return {
    description: 'get all categories of the user',
    parameters: z.object({
      type: z.enum(['income', 'expense', 'transfer', 'saving', 'invest']).optional(),
      message: z.string().describe('a short message with your personalities'),
    }),
    execute: async ({ type, message }: { type?: string; message: string }) => {
      try {
        const params: any = {}
        if (type) params.type = type
        const { categories }: { categories: any[] } = await getCategories(userId, params)

        return { categories, message }
      } catch (err: any) {
        const code = err.errorCode
        return {
          errorCode: code || '',
          error: code ? err.message : 'Failed to get categories',
        }
      }
    },
  }
}

// MARK: Get category
export const get_category = (userId: string, style?: string) => {
  return {
    description: 'get category by name',
    parameters: z.object({
      name: z.string(),
      type: z.enum(['income', 'expense', 'transfer', 'saving', 'invest']).optional(),
      message: z.string().describe('a short message with your personalities'),
    }),
    execute: async ({ name, type, message }: { name: string; type?: string; message: string }) => {
      try {
        const params: any = {}
        if (type) params.type = [type]
        const { categories }: { categories: any[] } = await getCategories(userId, params)

        const category = categories.find(c => c.name.toLowerCase() === name.toLowerCase())

        if (!category) {
          throw {
            errorCode: 'CATEGORY_NOT_FOUND',
            message: `No category found with name "${name}"`,
          }
        }

        return { category, message }
      } catch (err: any) {
        const code = err.errorCode
        return {
          errorCode: code || '',
          error: code ? err.message : 'Failed to get category',
        }
      }
    },
  }
}

// MARK: Create category
export const create_category = (userId: string, style?: string) => {
  return {
    description: 'create a category with the following properties: name, icon, type',
    parameters: z.object({
      name: z.string(),
      icon: z.string(),
      type: z.enum(['income', 'expense', 'transfer', 'saving', 'invest']),
      message: z.string().describe('a short message with your personalities'),
    }),
    execute: async ({
      name,
      icon,
      type,
      message,
    }: {
      name: string
      icon: string
      type: string
      message: string
    }) => {
      try {
        const { category } = await createCategory(userId, name, icon, type)
        return { category, message }
      } catch (err: any) {
        const code = err.errorCode
        return {
          errorCode: code || '',
          error: code ? err.message : 'Failed to create category',
        }
      }
    },
  }
}

// MARK: Update category
export const update_category = (userId: string, style?: string) => {
  return {
    description: 'update category by name',
    parameters: z.object({
      name: z.string(),
      newName: z.string(),
      icon: z.string(),
      message: z.string().describe('a short message with your personalities'),
    }),
    execute: async ({
      name,
      newName,
      icon,
      message,
    }: {
      name: string
      newName: string
      icon: string
      message: string
    }) => {
      try {
        const { categories }: { categories: any[] } = await getCategories(userId)
        const categoryToUpdate: any = categories.find(c => c.name.toLowerCase() === name.toLowerCase())

        if (!categoryToUpdate) {
          throw {
            errorCode: 'CATEGORY_NOT_FOUND',
            message: `No category found with name "${name}"`,
          }
        }

        const { category } = await updateCategory(categoryToUpdate._id, newName, icon)
        return { category, message }
      } catch (err: any) {
        const code = err.errorCode
        return {
          errorCode: code || '',
          error: code ? err.message : 'Failed to update category',
        }
      }
    },
  }
}

// MARK: Delete category
export const delete_category = (userId: string, style?: string) => {
  return {
    description: 'delete a category by name',
    parameters: z.object({
      name: z.string(),
      message: z.string().describe('a short message with your personalities'),
    }),
    execute: async ({ name, message }: { name: string; message: string }) => {
      try {
        const { categories }: { categories: any[] } = await getCategories(userId)
        const categoryToDelete = categories.find(c => c.name.toLowerCase() === name.toLowerCase())

        if (!categoryToDelete) {
          throw {
            errorCode: 'CATEGORY_NOT_FOUND',
            message: `No category found with name "${name}"`,
          }
        }

        const { category } = await deleteCategory(userId, categoryToDelete._id)
        return { category, message }
      } catch (err: any) {
        const code = err.errorCode
        return {
          errorCode: code || '',
          error: code ? err.message : 'Failed to delete category',
        }
      }
    },
  }
}
