import * as budgetTools from '@/lib/tools/budgetTools'
import * as categoryTools from '@/lib/tools/categoryTools'
import * as transactionTools from '@/lib/tools/transactionTools'
import * as walletTools from '@/lib/tools/walletTools'
import { extractToken } from '@/lib/utils'
import { openai } from '@ai-sdk/openai'
import { streamText } from 'ai'
import moment from 'moment-timezone'
import { NextRequest, NextResponse } from 'next/server'

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
- Get all: \`get_all_categories\`. Optional: type. Ex: "get income categories".
- Get one: \`get_category\`. Require: name, type (optional). Ex: "get category food".
- Create: \`create_category\`. Require: name, icon (emoji - auto-chosen), type. Ex: "create expense category clothes".
- Update: \`update_category\`. Require: name, new name, icon (emoji - auto-chosen). Ex: "rename food to food & beverage".
- Delete: \`delete_category\`. Needs: name. Ex: "delete category food".

**Budgets:**
- Get all budgets: \`get_budgets\`. Optional: category. Ex: "get budgets for food".
- Create a budget: \`create_budget\`. Require: category, total, begin, end. Ex: "budget food, 1000, 2024-01-01 to 2024-01-31".
- Update/Delete one: Demo mode, not allowed.

**Rules**:
- If user lacks info, ask for more details.
- Reply to date/time or expense questions only.
- For other tasks, say "I'm a demo, can't do that."
- Always reply under 50 words.
- After calling a tool, return a short message with a comment and the tool result (e.g., "Here are your wallets: [list]"). Use natural language.
`

export async function POST(req: NextRequest) {
  console.log('- Send Message - ')

  const timezone = req.headers.get('x-timezone') || 'UTC'
  moment.tz.setDefault(timezone)

  try {
    const token = await extractToken(req)
    const userId = token?._id as string

    // check if user is logged in
    if (!userId) {
      return NextResponse.json({ message: 'Please login to continue' }, { status: 401 })
    }

    // get messages history from request
    const { messages } = await req.json()

    // get the last 5 messages
    let recentMessages = messages.slice(-5)

    if (recentMessages[0]?.role === 'tool') {
      const allMessages = [...messages]
      const lastToolIndex = allMessages.findLastIndex(m => m.role === 'tool')

      if (lastToolIndex > 0) {
        const assistantBeforeTool = allMessages[lastToolIndex - 1]
        if (assistantBeforeTool?.role === 'assistant') {
          recentMessages = [assistantBeforeTool, ...recentMessages]
        }
      }
    }

    const result = streamText({
      model: openai('gpt-4o-mini'),
      system: content + `Current time is: ${moment().format('YYYY-MM-DD HH:mm:ss')}`,
      messages: recentMessages,
      abortSignal: req.signal,

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

    return result.toDataStreamResponse({
      headers: {
        'Content-Type': 'application/octet-stream',
        'Content-Encoding': 'none',
      },
    })
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 })
  }
}
