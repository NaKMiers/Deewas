import authOptions from '@/app/api/auth/[...nextauth]/authOptions'
import { TextStreamMessage } from '@/components/ai/message'
import * as budgetTools from '@/lib/tools/budgetTools'
import * as categoryTools from '@/lib/tools/categoryTools'
import * as transactionTools from '@/lib/tools/transactionTools'
import * as walletTools from '@/lib/tools/walletTools'
import { extractToken } from '@/lib/utils'
import { openai } from '@ai-sdk/openai'
import { CoreMessage, generateId } from 'ai'
import { createAI, createStreamableValue, getMutableAIState, streamUI } from 'ai/rsc'
import { LucideLoaderCircle } from 'lucide-react'
import { getServerSession } from 'next-auth'
import { NextRequest } from 'next/server'
import { ReactNode } from 'react'

const content = `\
You are a Deewas bot (expense app with AI), giving spending insights.

**Transactions:**
- Get all: \`get_all_transactions\`. Optional: type (income, expense, etc.), limit (default is 20 and max is 20). Ex: "get income transactions".
- Get one: \`get_transaction\`. Optional: name, amount (opt), type (opt). Ex: "get dumpling 50000".
- Create: \`create_transaction\`. Require: name, amount, date (default is today), wallet, type (auto), category (auto). Ex: "bought book 20000, today I bought dumpling 50000".
- Update (if user want to change name, amount, category, wallet of transaction): \`update_transaction\`. Require: name, new name (opt), amount (opt), new amount (opt), date (opt), new date(opt), category name (opt), new category name (opt), wallet name (opt), new wallet name (opt). Ex: "update book from 20000 to 10000".
- Delete: \`delete_transaction\`. Require: name, amount (opt). Ex: "delete book 20000".

**Wallets:**
- Get all: \`get_all_wallets\`. Ex: "get all wallets".
- Get one: \`get_wallet\`. Require: name. Ex: "get wallet cash".
- Create: \`create_wallet\`. Require: name, icon (emoji - auto-chosen). Ex: "create wallet cash".
- Delete: \`delete_wallet\`. Require: name, need to confirm with user. Ex: "delete wallet cash".
- Update: \`update_wallet\`. Require: name, new name, icon (emoji - auto-chosen). Ex: "rename cash to cash2".
- Transfer money from a wallet to another: \`transfer_fund_from_wallet_to_wallet\`. Required: from wallet, to wallet, amount, date (default is today). Ex: "transfer 100 cash to bank".

**Categories:**
- Get all categories: \`get_all_categories\`. Optional: type. Ex: "get income categories".
- Get one: \`get_category\`. Require: name, type (optional). Ex: "get category food".
- Create: \`create_category\`. Require: name, icon (emoji - auto-chosen), type. Ex: "create expense category clothes".
- Update: \`update_category\`. Require: name, new name, icon (emoji - auto-chosen). Ex: "rename food to food & beverage".
- Delete: \`delete_category\`. Needs: name. Ex: "delete category food".

**Budgets:**
- Get all: \`get_budgets\`. Optional: category. Ex: "get budgets for food".
- Create: \`create_budget\`. Require: category, total, begin, end. Ex: "budget food, 1000, 2024-01-01 to 2024-01-31".
- Update/Delete one: Demo mode, not allowed.

**Rules**:

If user does not provide enough information you should ask for more details.
You can reply question related to date time and personal expenses management. If the user wants to do or ask anything else, it is an impossible task, so you should respond that you are a demo and cannot do that.
Never reply user longer than 50 words

Current date UTC: ${new Date().toISOString()} 
`

export const sendMessage = async (message: string, req: NextRequest) => {
  'use server'

  // authenticate user
  let token = await getServerSession(authOptions)
  if (!token && req) {
    const user = await extractToken(req)
    if (user) token = { user }
  }
  const userId = token?.user?._id
  if (!userId) throw new Error('Please login to continue')

  const messages = getMutableAIState<typeof AI>('messages')
  const currentMessages = messages.get() as CoreMessage[]
  messages.update([...currentMessages, { role: 'user', content: message }])

  const contentStream = createStreamableValue('')
  const textComponent = <TextStreamMessage content={contentStream.value} />

  let recentMessages = currentMessages.slice(-5)

  if (recentMessages[0]?.role === 'tool') {
    const allMessages = [...currentMessages]
    const lastToolIndex = allMessages.findLastIndex(m => m.role === 'tool')

    if (lastToolIndex > 0) {
      const assistantBeforeTool = allMessages[lastToolIndex - 1]
      if (assistantBeforeTool?.role === 'assistant') {
        recentMessages = [assistantBeforeTool, ...recentMessages]
      }
    }
  }

  const messagesToSend = [...recentMessages, { role: 'user', content: message } as CoreMessage]

  const results = await streamUI({
    model: openai('gpt-4o-mini'),
    system: content,
    messages: messagesToSend,
    initial: (
      <div className="flex h-10 items-center justify-center text-muted-foreground">
        <LucideLoaderCircle className="animate-spin" />
      </div>
    ),
    text: async function* ({ content, done }) {
      if (done) {
        messages.done([...(messages.get() as CoreMessage[]), { role: 'assistant', content }])
        contentStream.done()
      } else {
        contentStream.update(content)
      }

      return textComponent
    },
    tools: {
      // Wallet
      get_all_wallets: walletTools.get_all_wallets(userId),
      get_wallet: walletTools.get_wallet(userId),
      create_wallet: walletTools.create_wallet(userId),
      delete_wallet: walletTools.delete_wallet(userId),
      update_wallet: walletTools.update_wallet(userId),
      transfer_fund_from_wallet_to_wallet: walletTools.transfer_fund_from_wallet_to_wallet(userId),

      // Category
      get_all_categories: categoryTools.get_all_categories(userId),
      get_category: categoryTools.get_category(userId),
      create_category: categoryTools.create_category(userId),
      update_category: categoryTools.update_category(userId),
      delete_category: categoryTools.delete_category(userId),

      // Budget
      get_budgets: budgetTools.get_budgets(userId),
      create_budget: budgetTools.create_budget(userId),

      // Transaction
      get_all_transactions: transactionTools.get_all_transactions(userId),
      get_transaction: transactionTools.get_transaction(userId),
      create_transaction: transactionTools.create_transaction(userId),
      update_transaction: transactionTools.update_transaction(userId),
      delete_transaction: transactionTools.delete_transaction(userId),
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
