import { getCategories } from '@/app/api/category'
import { createTransaction, deleteTransaction, getTransactions } from '@/app/api/transaction'
import { updateTransaction } from '@/app/api/transaction/'
import { getWallets } from '@/app/api/wallet'
import { TransactionType } from '@/models/TransactionModel'
import { openai } from '@ai-sdk/openai'
import { generateText } from 'ai'
import { z } from 'zod'

// MARK: Get all transactions
export const get_all_transactions = (userId: string) => {
  return {
    description: 'get all transactions of the user',
    parameters: z.object({
      type: z.enum(['income', 'expense', 'transfer', 'saving', 'invest']).optional(),
      limit: z.number().optional().default(20),
      message: z.string().describe('a short funny message about the transactions'),
    }),
    execute: async ({ type, limit, message }: { type?: string; limit?: number; message: string }) => {
      try {
        const params: any = {}
        if (type) params.type = [type]
        if (limit) params.limit = [limit]

        const { transactions }: { transactions: any[] } = await getTransactions(userId, params)
        return { transactions, message }
      } catch (err: any) {
        return { error: 'Failed to get transactions' }
      }
    },
  }
}

// MARK: Get transaction
export const get_transaction = (userId: string) => {
  return {
    description: 'get single transaction by name and amount and type',
    parameters: z.object({
      name: z.string(),
      amount: z.number().optional(),
      type: z.enum(['income', 'expense', 'transfer', 'saving', 'invest']).optional(),
      message: z.string().describe('a short funny message about the transaction'),
    }),
    execute: async ({
      name,
      amount,
      type,
      message,
    }: {
      name: string
      amount?: number
      type?: string
      message: string
    }) => {
      try {
        const { transactions }: { transactions: any[] } = await getTransactions(userId)

        if (!transactions.length) {
          return { error: `❌ No transaction found with name "${name}" and amount "${amount}"` }
        }

        const transaction = transactions.find(
          t =>
            t.name.toLowerCase() === name.toLowerCase() &&
            (!amount || t.amount === amount) &&
            (!type || t.type === type)
        )

        return { transaction, message }
      } catch (err: any) {
        return { error: '❌ Failed to get transaction' }
      }
    },
  }
}

// MARK: Create transaction
export const create_transaction = (userId: string) => {
  return {
    description: 'create a new transaction',
    parameters: z.object({
      name: z.string(),
      amount: z.number(),
      date: z.string(),
      type: z.enum(['income', 'expense', 'transfer', 'saving', 'invest']),
      walletName: z.string(),
      categoryName: z.string().optional(),
      message: z.string().describe('a short funny message about the transaction'),
    }),
    execute: async ({
      name,
      amount,
      date,
      type,
      walletName,
      categoryName,
      message,
    }: {
      name: string
      amount: number
      date: string
      type: TransactionType
      walletName: string
      categoryName?: string
      message: string
    }) => {
      try {
        const { wallets }: { wallets: any[] } = await getWallets(userId)
        const wallet = wallets.find(w => w.name.toLowerCase() === walletName.toLowerCase())

        if (!wallet) {
          return { error: `❌ No wallet found with name "${walletName}"` }
        }

        // I want to use AI to choose suitable category for the transaction
        const { categories }: { categories: any[] } = await getCategories(userId)

        let category = null

        if (categoryName) {
          category = categories.find(c => c.name.toLowerCase() === categoryName.toLowerCase())
        }

        if (!category) {
          const { text: index } = await generateText({
            model: openai('gpt-4o-mini'),
            messages: [
              {
                role: 'system',
                content: `You are an AI that classifies transactions into categories. 
                    Given a transaction name and a list of categories, choose the most relevant category. 
                    Return only the index of the best matching category as a number (0-based index). If no category matches return the index of uncategorized category of transaction type (which have deletable property is false).`,
              },
              {
                role: 'user',
                content: `Transaction Name: "${name}", Transaction Type: "${type}". 
                    Categories: ${JSON.stringify(categories.map((c, index) => ({ index, name: c.name })))}
                    
                    Which category should this transaction belong to? Respond with only the category index.`,
              },
            ],
          })

          category = categories[parseInt(index)]
        }

        const { transaction } = await createTransaction(
          userId,
          wallet._id,
          category._id,
          name,
          amount,
          date,
          type
        )

        return { transaction, message }
      } catch (err: any) {
        return { error: '❌ Failed to create transaction' }
      }
    },
  }
}

// MARK: Update transaction
export const update_transaction = (userId: string) => {
  return {
    description:
      'update transaction (using name or amount or date or category name or wallet name to find transaction)',
    parameters: z.object({
      name: z.string(),
      newName: z.string().optional(),
      amount: z.number().optional(),
      newAmount: z.number().optional(),
      date: z.string().optional(),
      newDate: z.string().optional(),
      categoryName: z.string().optional(),
      newCategoryName: z.string().optional(),
      walletName: z.string().optional(),
      newWalletName: z.string().optional(),
      message: z.string().describe('a short funny message about the transaction'),
    }),
    execute: async ({
      name,
      newName,
      amount,
      newAmount,
      date,
      newDate,
      categoryName,
      newCategoryName,
      walletName,
      newWalletName,
      message,
    }: {
      name: string
      newName?: string
      amount?: number
      newAmount?: number
      date?: string
      newDate?: string
      categoryName?: string
      newCategoryName?: string
      walletName?: string
      newWalletName?: string
      message: string
    }) => {
      try {
        const { transactions }: { transactions: any[] } = await getTransactions(userId)
        if (!transactions.length) {
          return { error: `❌ No transaction found with name "${name}" and amount "${amount}"` }
        }

        const transactionToUpdate = transactions.find(
          t =>
            t.name.toLowerCase() === name.toLowerCase() &&
            (!amount || t.amount === amount) &&
            (!date || t.date === date) &&
            (!walletName || t.wallet.name.toLowerCase() === walletName.toLowerCase()) &&
            (!categoryName || t.category.name.toLowerCase() === categoryName.toLowerCase())
        )

        let categoryId = transactionToUpdate.category._id
        if (newCategoryName) {
          const { categories }: { categories: any[] } = await getCategories(userId)
          const category = categories.find(c => c.name.toLowerCase() === newCategoryName.toLowerCase())
          if (!category) {
            return { error: `❌ No category found with name "${newCategoryName}"` }
          }

          categoryId = category._id
        }

        let walletId = transactionToUpdate.wallet._id

        // change wallet
        if (newWalletName) {
          const { wallets }: { wallets: any[] } = await getWallets(userId)
          const wallet = wallets.find(w => w.name.toLowerCase() === newWalletName.toLowerCase())
          if (!wallet) {
            return { error: `❌ No wallet found with name "${newWalletName}"` }
          }

          walletId = wallet._id
        }

        const { transaction } = await updateTransaction(
          transactionToUpdate._id,
          walletId,
          categoryId,
          newName || transactionToUpdate.name,
          newAmount || transactionToUpdate.amount,
          newDate || transactionToUpdate.date
        )

        return { transaction, message }
      } catch (err: any) {
        return { error: '❌ Failed to update transaction' }
      }
    },
  }
}

// MARK: Delete transaction
export const delete_transaction = (userId: string) => {
  return {
    description:
      'delete transaction by name and amount (using name and amount(if has) to find transaction)',
    parameters: z.object({
      name: z.string(),
      amount: z.number().optional(),
      message: z.string().describe('a short funny message about the transaction'),
    }),
    execute: async ({ name, amount, message }: { name: string; amount?: number; message: string }) => {
      try {
        const { transactions }: { transactions: any[] } = await getTransactions(userId)

        if (!transactions.length) {
          return { error: `❌ No transaction found with name "${name}" and amount "${amount}"` }
        }

        const transaction = transactions.find(
          t => t.name.toLowerCase() === name.toLowerCase() && (!amount || t.amount === amount)
        )

        if (!transaction) {
          return {
            error: `❌ No transaction found with name "${name}" ${amount ? `and amount "${amount}"` : ''}`,
          }
        }

        await deleteTransaction(transaction._id)

        return { transaction, message }
      } catch (err: any) {
        return {
          error: `❌ Failed to delete transaction: ${err.message}`,
        }
      }
    },
  }
}
