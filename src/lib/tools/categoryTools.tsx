import { createCategory, deleteCategory, getCategories } from '@/app/api/category'
import { updateCategory } from '@/app/api/category/'
import { z } from 'zod'

// MARK: Get all categories
export const get_all_categories = (userId: string) => {
  return {
    description: 'get all categories of the user',
    parameters: z.object({
      type: z.enum(['income', 'expense', 'transfer', 'saving', 'invest']).optional(),
    }),
    execute: async ({ type }: { type?: string }) => {
      try {
        const params: any = {}
        if (type) params.type = type
        const { categories }: { categories: any[] } = await getCategories(userId, params)

        return { categories }
      } catch (err: any) {
        return { error: `Failed to get categories: ${err.message}` }
      }
    },
  }
}

// MARK: Get category
export const get_category = (userId: string) => {
  return {
    description: 'get category by name',
    parameters: z.object({
      name: z.string(),
      type: z.enum(['income', 'expense', 'transfer', 'saving', 'invest']).optional(),
    }),
    execute: async ({ name, type }: { name: string; type?: string }) => {
      try {
        const params: any = {}
        if (type) params.type = [type]
        const { categories }: { categories: any[] } = await getCategories(userId, params)

        const category = categories.find(c => c.name.toLowerCase() === name.toLowerCase())

        if (!category) {
          return { error: `No category found with name "${name}"` }
        }

        return { category }
      } catch (err: any) {
        return {
          error: `Failed to get category: ${err.message}`,
        }
      }
    },
  }
}

// MARK: Create category
export const create_category = (userId: string) => {
  return {
    description: 'create a category with the following properties: name, icon, type',
    parameters: z.object({
      name: z.string(),
      icon: z.string(),
      type: z.enum(['income', 'expense', 'transfer', 'saving', 'invest']),
    }),
    execute: async ({ name, icon, type }: { name: string; icon: string; type: string }) => {
      try {
        const { category } = await createCategory(userId, name, icon, type)
        return { category }
      } catch (err: any) {
        return { error: `Failed to create category: ${err.message}` }
      }
    },
  }
}

// MARK: Update category
export const update_category = (userId: string) => {
  return {
    description: 'update category by name',
    parameters: z.object({
      name: z.string(),
      newName: z.string(),
      icon: z.string(),
    }),
    execute: async ({ name, newName, icon }: { name: string; newName: string; icon: string }) => {
      try {
        const { categories }: { categories: any[] } = await getCategories(userId)
        const categoryToUpdate: any = categories.find(c => c.name.toLowerCase() === name.toLowerCase())

        if (!categoryToUpdate) {
          return { error: `No category found with name "${name}"` }
        }

        const { category } = await updateCategory(categoryToUpdate._id, newName, icon)
        return { category }
      } catch (err: any) {
        return { error: `Failed to update category: ${err.message}` }
      }
    },
  }
}

// MARK: Delete category
export const delete_category = (userId: string) => {
  return {
    description: 'delete a category by name',
    parameters: z.object({
      name: z.string(),
    }),
    execute: async ({ name }: { name: string }) => {
      try {
        const { categories }: { categories: any[] } = await getCategories(userId)
        const categoryToDelete = categories.find(c => c.name.toLowerCase() === name.toLowerCase())

        if (!categoryToDelete) {
          return { error: `No category found with name "${name}"` }
        }

        const { category } = await deleteCategory(userId, categoryToDelete._id)
        return { category }
      } catch (err: any) {
        return { error: `Failed to delete category: ${err.message}` }
      }
    },
  }
}
