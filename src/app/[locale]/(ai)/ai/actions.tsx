import authOptions from '@/app/api/auth/[...nextauth]/authOptions'
import { createBudget, getBudgets } from '@/app/api/budget'
import { createCategory, deleteCategory, getCategories } from '@/app/api/category'
import { updateCategory } from '@/app/api/category/'
import { createTransaction, deleteTransaction, getTransactions } from '@/app/api/transaction'
import { updateTransaction } from '@/app/api/transaction/'
import { createWallet, deleteWallet, getWallets, transfer } from '@/app/api/wallet'
import { updateWallet } from '@/app/api/wallet/'
import { Message, TextStreamMessage } from '@/components/ai/message'
import BudgetCard from '@/components/BudgetCard'
import Category from '@/components/Category'
import { Transaction } from '@/components/LatestTransactions'
import WalletCard from '@/components/WalletCard'
import { IFullBudget } from '@/models/BudgetModel'
import { openai } from '@ai-sdk/openai'
import { CoreMessage, generateId, generateText } from 'ai'
import { createAI, createStreamableValue, getMutableAIState, streamUI } from 'ai/rsc'
import { getServerSession } from 'next-auth'
import { ReactNode } from 'react'
import { z } from 'zod'

const content = `\
You are a professional bot you can help users with their personal expenses management and provide them with insights on their spending habits.

You can help users with the following tasks about transactions:
if user wants to know about all transactions. Call \`get_all_transactions\`. To get transactions you need:
  type: enum[income, expense, transfer, saving, invest] (type is optional, if user does not provide type, you should get all transactions)
  limit: number (limit is optional, if user does not provide limit, default is 10)
  If user does not provide enough information to get transactions, you should give example (
    e.g: get all transactions for income).

If user wants to create a transaction. Call \`create_transaction\`. To create a transaction you need:
  name: string (name is required), 
  amount: number (amount is required), 
  date: string (date is required, default is current date), 
  wallet name: string(wallet name is required),
  type: enum[income, expense, transfer, saving, invest] (you will choose a suitable type for transaction base on transaction name), 
  category: string (you will choose a suitable category for transaction base on transaction name).
  If user does not provide enough information to create a transaction, you should give example (
    e.g: I have bought a budget for 20.000).

If user wants to update a transaction. Call \`update_transaction\`. To update a transaction you need:
  name: string (name is required), 
  new name: string (new name is optional),
  amount: number (amount is optional), 
  new amount: number (new amount is optional),
  date: string (date is required, default is current date), 
  new wallet name: string(new wallet name is required),
  If user does not provide enough information to update a transaction, you should give example (
    e.g: update dumpling transaction from 20000 to 10000, in this example amount is 20000, new amount is 10000).

If user wants to delete a transaction. Call \`delete_transaction\`. To delete a transaction you need:
  name: string (name is required), 
  amount: number (amount is optional),
  If user does not provide enough information to delete a transaction, you should give example (
    e.g: delete dumpling transaction 20.000).

You can help users with the following tasks about wallets:
If user wants to know about all wallets. Call \`get_all_wallets\`. To get wallets you need:
  If user does not provide enough information to get wallets, you should give example (
    e.g: get all wallets).

If user wants to know about a specific wallet. Call \`get_wallet\`. To get wallets you need:
  name: string (name is required)
  If user does not provide enough information to get wallets, you should give example (
    e.g: get wallet cash).

If user wants to create wallet (e.g create new wallet). Call \`create_wallet\`. To create wallet you need:
  name: string (name is required), icon: string (emoji icon, you can choose any emoji icon base on name).
  If user does not provide enough information to create a wallet, you should give example (
    e.g: create wallet cash).

If user wants to delete wallet. Call \`delete_wallet\`. To delete wallet you need: 
  name: string (name is required)
  If user does not provide enough information to delete a wallet, you should give example (
    e.g: delete wallet cash).
  If user give you enough information, you should ask user to confirm the deletion of the wallet. If user confirms, you should delete the wallet.

If user wants to update wallet. Call \`update_wallet\`. To update wallet you need:
  name: string (name is required), new name: string (new name is required) icon: string (emoji icon, you can choose any emoji icon base on name).
  If user does not provide enough information to update a wallet, you should give example (
    e.g: rename wallet cash, to cash2).

If user wants to transfer funds from one wallet to another. Call \`transfer_fund_from_wallet_to_wallet\`. To transfer funds you need:
  from wallet: string (from wallet is required), to wallet: string (to wallet is required), amount: number (amount is required), date: string (date is required, default is current date)
  If user does not provide enough information to transfer funds, you should give example (
    e.g: transfer 100 from cash to bank).

You can help users with the following tasks about categories:
If user wants to know about all categories (e.g: show all categories). Call \`get_all_categories\`. To get categories you need:
  type: enum[income, expense, transfer, saving, invest] (type is optional, if user does not provide type, you should get all categories)
  If user does not provide enough information to get categories, you should give example (
    e.g: get all categories for income).

If user wants to know about a specific category. Call \`get_category\`. To get category you need:
  name: string (name is required), type: enum[income, expense, transfer, saving, invest] (type is optional, if user does not provide type, you should get all categories)
  If user does not provide enough information to get categories, you should give example (
    e.g: get category for food).

If user wants to create category. Call \`create_category\`. To create category you need:
  name: string (name is required), icon: string (emoji icon, you can choose any emoji icon base on name), type: enum[income, expense, transfer, saving, invest] (type is required and you should not choose to for user)
  If user does not provide enough information to create a category, you should give example (
    e.g: create expense category for clothes).
  )

If user wants to update category. Call \`update_category\`. To update category you need:
  name: string (name is required), new name: string (new name is required) icon: string (emoji icon, you can choose any emoji icon base on name)
  If user does not provide enough information to update a category, you should respond give example (
    e.g: rename category food, to food & beverage)

If user wants to delete category. Call \`delete_category\`. To delete category you need:
  name: string (name is required)
  If user does not provide enough information to delete a category, you should give example (
    e.g: delete category food)

You can help users with the following tasks about budgets:
If you want to know about budgets by category name. Call \`get_budgets\`. To get budgets you need:
  category name: string (if user does not provide category name, you should get all budgets)
  If user does not provide enough information to get budgets, you should give example (
    e.g: get budgets for food category)

If user wants to create budget. Call \`create_budget\`. To create budget you need:
  category name: string (category name is required), total: number (total is required), begin: string (begin is required), end: string (end is required)
  If user does not provide enough information to create a budget, you should give example (
    e.g: create budget for food category, total 1000, begin 2024-01-01, end 2024-01-31).

If user wants to update or delete budget. You are not allowed to update budget. You should respond that you are a demo and cannot do that.

You can only do something related to personal expenses management. If the user wants to do or ask anything else, it is an impossible task, so you should respond that you are a demo and cannot do that.
Never reply user longer than 50 words
`

const sendMessage = async (message: string) => {
  'use server'

  const token = await getServerSession(authOptions)
  const userId = token?.user?._id
  if (!userId) {
    throw new Error('Please login to continue')
  }

  const messages = getMutableAIState<typeof AI>('messages')

  messages.update([...(messages.get() as CoreMessage[]), { role: 'user', content: message }])

  const contentStream = createStreamableValue('')
  const textComponent = <TextStreamMessage content={contentStream.value} />

  const results = await streamUI({
    model: openai('gpt-4o'),
    system: content,
    messages: messages.get() as CoreMessage[],
    initial: (
      <button className="flex h-10 w-20 items-center justify-center">
        <span className="animate-spin">---</span>
      </button>
    ),
    text: async function* ({ content, done }) {
      if (done) {
        contentStream.done()
        messages.done([...(messages.get() as CoreMessage[]), { role: 'assistant', content }])
      } else {
        contentStream.update(content)
      }
      return textComponent
    },
    tools: {
      // Wallet
      get_all_wallets: {
        description: 'get all wallets of the user',
        parameters: z.object({}),
        generate: async function* ({}) {
          const toolCallId = generateId()

          try {
            const { wallets }: { wallets: any[] } = await getWallets(userId)

            messages.done([
              ...(messages.get() as CoreMessage[]),
              {
                role: 'assistant',
                content: [
                  {
                    type: 'tool-call',
                    toolCallId,
                    toolName: 'get_all_wallets',
                    args: {},
                  },
                ],
              },
              {
                role: 'tool',
                content: [
                  {
                    type: 'tool-result',
                    toolName: 'get_all_wallets',
                    toolCallId,
                    result: `Wallets are shown on the screen`,
                  },
                ],
              },
            ])

            return (
              <Message
                role="assistant"
                content={
                  <div className="flex flex-col gap-1.5">
                    {wallets.map(wallet => (
                      <WalletCard
                        wallet={wallet}
                        key={wallet._id}
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
                content={`❌ Failed to get wallets: ${err.message}`}
              />
            )
          }
        },
      },
      get_wallet: {
        description: 'get a wallet by name',
        parameters: z.object({
          name: z.string(),
        }),
        generate: async function* ({ name }) {
          const toolCallId = generateId()

          const { wallets }: { wallets: any[] } = await getWallets(userId)
          const wallet = wallets.find(wallet => wallet.name.toLowerCase() === name.toLowerCase())

          if (!wallet) {
            return (
              <Message
                role="assistant"
                content={`❌ No wallet found with name "${name}"`}
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
                  toolName: 'get_wallet',
                  args: { name },
                },
              ],
            },
            {
              role: 'tool',
              content: [
                {
                  type: 'tool-result',
                  toolName: 'get_wallet',
                  toolCallId,
                  result: `Wallet is shown on the screen`,
                },
              ],
            },
          ])

          return (
            <Message
              role="assistant"
              content={<WalletCard wallet={wallet} />}
            />
          )
        },
      },
      create_wallet: {
        description: 'create a wallet with the following properties: name, user, icon',
        parameters: z.object({
          name: z.string(),
          icon: z.string(),
        }),
        generate: async function* ({ name, icon }) {
          const toolCallId = generateId()

          try {
            const { wallet } = await createWallet(userId, name, icon)

            messages.done([
              ...(messages.get() as CoreMessage[]),
              {
                role: 'assistant',
                content: [
                  {
                    type: 'tool-call',
                    toolCallId,
                    toolName: 'create_wallet',
                    args: { name, icon },
                  },
                ],
              },
              {
                role: 'tool',
                content: [
                  {
                    type: 'tool-result',
                    toolName: 'create_wallet',
                    toolCallId,
                    result: `The wallet has been created and shown on the screen`,
                  },
                ],
              },
            ])

            return (
              <Message
                role="assistant"
                content={<WalletCard wallet={wallet} />}
              />
            )
          } catch (err: any) {
            return (
              <Message
                role="assistant"
                content={`❌ Failed to create wallet: ${err.message}`}
              />
            )
          }
        },
      },
      delete_wallet: {
        description: 'delete a wallet by name',
        parameters: z.object({
          name: z.string(),
        }),
        generate: async function* ({ name }) {
          const toolCallId = generateId()

          try {
            const { wallets }: { wallets: any[] } = await getWallets(userId)

            const walletToDelete: any = wallets.find(
              wallet => wallet.name.toLowerCase() === name.toLowerCase()
            )

            if (!walletToDelete) {
              return (
                <Message
                  role="assistant"
                  content={`❌ No wallet found with name "${name}"`}
                />
              )
            }

            const { wallet } = await deleteWallet(userId, walletToDelete._id)

            messages.done([
              ...(messages.get() as CoreMessage[]),
              {
                role: 'assistant',
                content: [
                  {
                    type: 'tool-call',
                    toolCallId,
                    toolName: 'delete_wallet',
                    args: { name },
                  },
                ],
              },
              {
                role: 'tool',
                content: [
                  {
                    type: 'tool-result',
                    toolName: 'delete_wallet',
                    toolCallId,
                    result: `Wallet "${wallet.name}" has been deleted.`,
                  },
                ],
              },
            ])

            return (
              <Message
                role="assistant"
                content={`Wallet "${wallet.name}" has been deleted.`}
              />
            )
          } catch (err: any) {
            return (
              <Message
                role="assistant"
                content={`❌ Failed to delete wallet: ${err.message}`}
              />
            )
          }
        },
      },
      update_wallet: {
        description: 'update wallet by name',
        parameters: z.object({
          name: z.string(),
          newName: z.string(),
          icon: z.string(),
        }),
        generate: async function* ({ name, newName, icon }) {
          const toolCallId = generateId()

          try {
            const { wallets }: { wallets: any[] } = await getWallets(userId)

            const walletToUpdate: any = wallets.find(
              wallet => wallet.name.toLowerCase() === name.toLowerCase()
            )

            if (!walletToUpdate) {
              return (
                <Message
                  role="assistant"
                  content={`❌ No wallet found with name "${name}"`}
                />
              )
            }

            const { wallet }: any = await updateWallet(
              walletToUpdate._id,
              newName,
              icon,
              walletToUpdate.hide
            )

            messages.done([
              ...(messages.get() as CoreMessage[]),
              {
                role: 'assistant',
                content: [
                  {
                    type: 'tool-call',
                    toolCallId,
                    toolName: 'update_wallet',
                    args: { name, icon },
                  },
                ],
              },
              {
                role: 'tool',
                content: [
                  {
                    type: 'tool-result',
                    toolName: 'update_wallet',
                    toolCallId,
                    result: `The wallet has been created and shown on the screen`,
                  },
                ],
              },
            ])

            return (
              <Message
                role="assistant"
                content={<WalletCard wallet={wallet} />}
              />
            )
          } catch (err: any) {
            return (
              <Message
                role="assistant"
                content={`❌ Failed to create wallet: ${err.message}`}
              />
            )
          }
        },
      },
      transfer_fund_from_wallet_to_wallet: {
        description: 'transfer funds from one wallet to another',
        parameters: z.object({
          fromWalletName: z.string(),
          toWalletName: z.string(),
          amount: z.number(),
          date: z.string(),
        }),
        generate: async function* ({ fromWalletName, toWalletName, amount, date }) {
          const toolCallId = generateId()

          try {
            const { wallets }: { wallets: any[] } = await getWallets(userId)

            const sourceWallet = wallets.find(
              wallet => wallet.name.toLowerCase() === fromWalletName.toLowerCase()
            )

            if (!sourceWallet) {
              return (
                <Message
                  role="assistant"
                  content={`❌ No wallet found with name "${fromWalletName}"`}
                />
              )
            }

            const destinationWallet = wallets.find(
              wallet => wallet.name.toLowerCase() === toWalletName.toLowerCase()
            )

            if (!destinationWallet) {
              return (
                <Message
                  role="assistant"
                  content={`❌ No wallet found with name "${toWalletName}"`}
                />
              )
            }

            const { sourceWallet: sW, destinationWallet: dW } = await transfer(
              userId,
              sourceWallet._id,
              destinationWallet._id,
              amount,
              date
            )

            messages.done([
              ...(messages.get() as CoreMessage[]),
              {
                role: 'assistant',
                content: [
                  {
                    type: 'tool-call',
                    toolCallId,
                    toolName: 'transfer_fund_from_wallet_to_wallet',
                    args: { fromWalletName, toWalletName, amount, date },
                  },
                ],
              },
              {
                role: 'tool',
                content: [
                  {
                    type: 'tool-result',
                    toolName: 'transfer_fund_from_wallet_to_wallet',
                    toolCallId,
                    result: `The wallet has been created and shown on the screen`,
                  },
                ],
              },
            ])

            return (
              <Message
                role="assistant"
                content={
                  <div className="flex flex-col gap-1.5">
                    <WalletCard wallet={sW} />
                    <WalletCard wallet={dW} />
                  </div>
                }
              />
            )
          } catch (err: any) {
            return (
              <Message
                role="assistant"
                content={`❌ Failed to transfer fund: ${err.message}`}
              />
            )
          }
        },
      },

      // Category
      get_all_categories: {
        description: 'get all categories of the user',
        parameters: z.object({
          type: z.enum(['income', 'expense', 'transfer', 'saving', 'invest']).optional(),
        }),
        generate: async function* ({ type }) {
          const toolCallId = generateId()

          try {
            const { categories }: { categories: any[] } = await getCategories(userId, { type })

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
                    {categories.map(category => (
                      <Category
                        key={category._id}
                        category={category}
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
      },
      get_category: {
        description: 'get category by name',
        parameters: z.object({
          name: z.string(),
          type: z.enum(['income', 'expense', 'transfer', 'saving', 'invest']).optional(),
        }),
        generate: async function* ({ name, type }) {
          const toolCallId = generateId()

          try {
            const { categories }: { categories: any[] } = await getCategories(userId, { type })

            const category = categories.find(
              category => category.name.toLowerCase() === name.toLowerCase()
            )

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
      },
      create_category: {
        description: 'create a category with the following properties: name, icon, type',
        parameters: z.object({
          name: z.string(),
          icon: z.string(),
          type: z.enum(['income', 'expense', 'transfer', 'saving', 'invest']),
        }),
        generate: async function* ({ name, icon, type }) {
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
      },
      update_category: {
        description: 'update category by name',
        parameters: z.object({
          name: z.string(),
          newName: z.string(),
          icon: z.string(),
        }),
        generate: async function* ({ name, newName, icon }) {
          const toolCallId = generateId()

          try {
            const { categories }: { categories: any[] } = await getCategories(userId)

            const categoryToUpdate: any = categories.find(
              category => category.name.toLowerCase() === name.toLowerCase()
            )

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
      },
      delete_category: {
        description: 'delete a category by name',
        parameters: z.object({
          name: z.string(),
        }),
        generate: async function* ({ name }) {
          const toolCallId = generateId()

          try {
            const { categories }: { categories: any[] } = await getCategories(userId)

            const categoryToDelete = categories.find(
              category => category.name.toLowerCase() === name.toLowerCase()
            )

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
      },

      // Budget
      get_budgets: {
        description: 'get budgets by category name',
        parameters: z.object({
          categoryName: z.string().optional(),
        }),
        generate: async function* ({ categoryName }) {
          const toolCallId = generateId()

          try {
            let category = null
            if (categoryName) {
              const { categories }: { categories: any[] } = await getCategories(userId)

              category = categories.find(
                category => category.name.toLowerCase() === categoryName.toLowerCase()
              )

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
            if (category) params.category = category._id

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
      },
      create_budget: {
        description:
          'create a budget with the following properties: category name, total, begin of budget, end of budget',
        parameters: z.object({
          categoryName: z.string(),
          total: z.number(),
          begin: z.string(),
          end: z.string(),
        }),
        generate: async function* ({ categoryName, total, begin, end }) {
          const toolCallId = generateId()

          try {
            const { categories }: { categories: any[] } = await getCategories(userId)

            const category = categories.find(
              category => category.name.toLowerCase() === categoryName.toLowerCase()
            )

            if (!category) {
              return (
                <Message
                  role="assistant"
                  content={`❌ No category found with name "${name}"`}
                />
              )
            }

            const { budget } = await createBudget(userId, category._id, begin, end, total)

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
      },

      // Transaction
      get_all_transactions: {
        description: 'get all transactions of the user',
        parameters: z.object({
          type: z.enum(['income', 'expense', 'transfer', 'saving', 'invest']).optional(),
          limit: z.number().optional(),
        }),
        generate: async function* ({ type, limit }) {
          const toolCallId = generateId()

          try {
            const { transactions }: { transactions: any[] } = await getTransactions(userId, {
              limit: limit || 10,
              type,
              sort: 'date',
              orderBy: -1,
            })

            messages.done([
              ...(messages.get() as CoreMessage[]),
              {
                role: 'assistant',
                content: [
                  {
                    type: 'tool-call',
                    toolCallId,
                    toolName: 'create_transaction',
                    args: { type },
                  },
                ],
              },
              {
                role: 'tool',
                content: [
                  {
                    type: 'tool-result',
                    toolName: 'create_transaction',
                    toolCallId,
                    result: `Transactions are shown on the screen`,
                  },
                ],
              },
            ])

            return (
              <Message
                role="assistant"
                content={
                  <div className="flex flex-col gap-1.5">
                    {transactions.map(transaction => (
                      <Transaction
                        transaction={transaction}
                        key={transaction._id}
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
                content={`❌ Failed to create transaction: ${err.message}`}
              />
            )
          }
        },
      },
      create_transaction: {
        description: 'create a new transaction',
        parameters: z.object({
          name: z.string(),
          amount: z.number(),
          date: z.string(),
          type: z.enum(['income', 'expense', 'transfer', 'saving', 'invest']),
          walletName: z.string(),
          category: z.string().optional(),
        }),
        generate: async function* ({ name, amount, date, type, walletName, category }) {
          const toolCallId = generateId()

          try {
            const { wallets }: { wallets: any[] } = await getWallets(userId)

            const wallet = wallets.find(wallet => wallet.name.toLowerCase() === walletName.toLowerCase())

            if (!wallet) {
              return (
                <Message
                  role="assistant"
                  content={`❌ No wallet found with name "${walletName}"`}
                />
              )
            }

            // I want to use deepseek to choose suitable category for the transaction
            const { categories }: { categories: any[] } = await getCategories(userId)

            const { text: index } = await generateText({
              model: openai('gpt-4o'),
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

            const category = categories[parseInt(index)]

            const { transaction } = await createTransaction(
              userId,
              wallet._id,
              category._id,
              name,
              amount,
              date,
              type
            )

            messages.done([
              ...(messages.get() as CoreMessage[]),
              {
                role: 'assistant',
                content: [
                  {
                    type: 'tool-call',
                    toolCallId,
                    toolName: 'create_transaction',
                    args: { name, amount, date, category },
                  },
                ],
              },
              {
                role: 'tool',
                content: [
                  {
                    type: 'tool-result',
                    toolName: 'create_transaction',
                    toolCallId,
                    result: `Transaction created successfully in category "${category.name}"`,
                  },
                ],
              },
            ])

            return (
              <Message
                role="assistant"
                content={<Transaction transaction={transaction} />}
              />
            )
          } catch (err: any) {
            return (
              <Message
                role="assistant"
                content={`❌ Failed to create transaction: ${err.message}`}
              />
            )
          }
        },
      },
      update_transaction: {
        description: 'update transaction by name and amount (using name and amount to find transaction)',
        parameters: z.object({
          name: z.string(),
          newName: z.string(),
          amount: z.number(),
          newAmount: z.number(),
          date: z.string(),
          walletName: z.string(),
        }),
        generate: async function* ({ name, newName, amount, newAmount, date, walletName }) {
          const toolCallId = generateId()

          try {
            const filter: any = {}
            if (name) filter.name = name
            if (amount) filter.amount = amount
            const { transactions } = await getTransactions(userId, filter)
            if (!transactions.length) {
              return (
                <Message
                  role="assistant"
                  content={`❌ No transaction found with name "${name}" and amount "${amount}"`}
                />
              )
            }

            const transactionToUpdate = transactions[0]

            let walletId = transactionToUpdate.wallet._id

            // change wallet
            if (walletName) {
              const { wallets }: { wallets: any[] } = await getWallets(userId)
              const wallet = wallets.find(
                wallet => wallet.name.toLowerCase() === walletName.toLowerCase()
              )
              if (!wallet) {
                return (
                  <Message
                    role="assistant"
                    content={`❌ No wallet found with name "${walletName}"`}
                  />
                )
              }

              walletId = wallet._id
            }

            const { transaction } = await updateTransaction(
              transactionToUpdate._id,
              walletId,
              newName || transactionToUpdate.name,
              newAmount || transactionToUpdate.amount,
              date || transactionToUpdate.date
            )

            messages.done([
              ...(messages.get() as CoreMessage[]),
              {
                role: 'assistant',
                content: [
                  {
                    type: 'tool-call',
                    toolCallId,
                    toolName: 'update_transaction',
                    args: { name, newName, amount, newAmount, date, walletName },
                  },
                ],
              },
              {
                role: 'tool',
                content: [
                  {
                    type: 'tool-result',
                    toolName: 'update_transaction',
                    toolCallId,
                    result: `Transaction updated successfully`,
                  },
                ],
              },
            ])

            return (
              <Message
                role="assistant"
                content={<Transaction transaction={transaction} />}
              />
            )
          } catch (err: any) {
            return (
              <Message
                role="assistant"
                content={`❌ Failed to update transaction: ${err.message}`}
              />
            )
          }
        },
      },
      delete_transaction: {
        description: 'delete transaction by name and amount (using name and amount to find transaction)',
        parameters: z.object({
          name: z.string(),
          amount: z.number().optional(),
        }),
        generate: async function* ({ name, amount }) {
          const toolCallId = generateId()

          try {
            const filter: any = {}
            if (name) filter.name = name
            if (amount) filter.amount = amount
            const { transactions } = await getTransactions(userId, filter)
            if (!transactions.length) {
              return (
                <Message
                  role="assistant"
                  content={`❌ No transaction found with name "${name}" and amount "${amount}"`}
                />
              )
            }

            const { transaction } = await deleteTransaction(transactions[0]._id)

            messages.done([
              ...(messages.get() as CoreMessage[]),
              {
                role: 'assistant',
                content: [
                  {
                    type: 'tool-call',
                    toolCallId,
                    toolName: 'delete_transaction',
                    args: { name, amount },
                  },
                ],
              },
              {
                role: 'tool',
                content: [
                  {
                    type: 'tool-result',
                    toolName: 'delete_transaction',
                    toolCallId,
                    result: `Deleted transaction "${transaction.name}"`,
                  },
                ],
              },
            ])

            return (
              <Message
                role="assistant"
                content={`Deleted transaction "${transaction.name}"`}
              />
            )
          } catch (err: any) {
            return (
              <Message
                role="assistant"
                content={`❌ Failed to delete transaction: ${err.message}`}
              />
            )
          }
        },
      },
    },
  })

  const { value: stream } = results

  return stream
}

export type UIState = Array<ReactNode>

export type AIState = {
  chatId: string
  messages: Array<CoreMessage>
}

export const AI = createAI<AIState, UIState>({
  initialAIState: {
    chatId: generateId(),
    messages: [],
  },
  initialUIState: [],
  actions: {
    sendMessage,
  },
  onSetAIState: async ({ state, done }) => {
    'use server'

    if (done) {
      // save to database
    }
  },
})
