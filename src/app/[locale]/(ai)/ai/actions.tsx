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
import { deepseek } from '@ai-sdk/deepseek'
import { CoreMessage, generateId, generateText } from 'ai'
import { createAI, createStreamableValue, getMutableAIState, streamUI } from 'ai/rsc'
import { getServerSession } from 'next-auth'
import { ReactNode } from 'react'
import { z } from 'zod'

const content = `\
Bot for "Deewas" expenses app. Handle transactions, wallets, categories, budgets via tools. Reply <50 words. Non-expense tasks: "I'm a demo, can’t do that."
`

const sendMessage = async (message: string) => {
  'use server'

  const token = await getServerSession(authOptions)
  const userId = token?.user?._id
  if (!userId) {
    throw new Error('Please login to continue')
  }

  const messages = getMutableAIState<typeof AI>('messages')
  const currentMessages = messages.get() as CoreMessage[]
  messages.update([...currentMessages, { role: 'user', content: message }])

  console.log('messages', currentMessages)

  const contentStream = createStreamableValue('')
  const textComponent = <TextStreamMessage content={contentStream.value} />

  // Only get the last 5 messages
  const recentMessages = currentMessages.slice(-5)
  const messagesToSend = [
    ...recentMessages,
    { role: 'user', content: message } as CoreMessage, // make sure the last message is the user's message
  ]

  const results = await streamUI({
    model: deepseek('deepseek-chat'),
    system: content,
    messages: messagesToSend,
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
              model: deepseek('deepseek-chat'),
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
              transactionToUpdate.category._id,
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
