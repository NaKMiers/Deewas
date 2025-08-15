import { personalities } from '@/constants'
import * as budgetTools from '@/lib/tools/budgetTools'
import * as categoryTools from '@/lib/tools/categoryTools'
import * as transactionTools from '@/lib/tools/transactionTools'
import * as walletTools from '@/lib/tools/walletTools'
import { checkPremium, extractToken } from '@/lib/utils'
import SettingsModel from '@/models/SettingsModel'
import { openai } from '@ai-sdk/openai'
import { streamText } from 'ai'
import tokenizer from 'gpt-tokenizer'
import moment from 'moment-timezone'
import { NextRequest, NextResponse } from 'next/server'

// Models: Setting
import { connectDatabase } from '@/config/database'
import '@/models/SettingsModel'

export async function POST(req: NextRequest) {
  console.log('- Send Message - ')

  // timezone
  const timezone = req.headers.get('x-timezone') || 'UTC'
  moment.tz.setDefault(timezone)

  // language
  const language = req.headers.get('x-language') || 'English'

  // personalities
  const rawPersonalities = req.headers.get('x-personalities')
  let styles: any[] = rawPersonalities ? JSON.parse(rawPersonalities) : [0]
  styles = styles.map((style: any) => personalities[style])
  const personalityPrompts = styles.map((s: any) => `"${s.title}": ${s.prompt}`).join(' and ')

  const content = `\
  You are my"${styles.map(s => s.title).join(' and ')}", you giving spending insights.

  **Transactions:**
  - Get all: \`get_all_transactions\`. Optional: type (income, expense, etc.), limit (default is 20 and max is 20). Ex: "get income transactions".
  - Create: \`create_transaction\`. Require: name, amount, date (default is today), wallet, type (auto), category (auto). Ex: "bought book 20000, today I bought dumpling 50000".
  - Update (if user want to change name, amount, category, wallet of transaction): \`update_transaction\`. Require: name, new name (opt), amount (opt), new amount (opt), date (opt), new date(opt), category name (opt), new category name (opt), wallet name (opt), new wallet name (opt). Ex: "update book from 20000 to 10000".
  - Delete: \`delete_transaction\`. Require: name, amount (opt). Ex: "delete book 20000".
  - Get most expensive/cheapest transaction: \`get_most_transaction\`. Optional: type (income, expense, etc.), limit (default is 1). Ex: "get most expensive transaction".
  
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
  - Get all budgets: \`get_all_budgets\`. Optional: category. Ex: "get budgets for food".
  - Create a budget: \`create_budget\`. Require: category name, total, begin date, end date. Ex: "budget for category food 200$, start date and end date of this month".
  - Delete a budget: \`delete_budget\`. Require: category name, total, begin date, end date. Ex: "delete budget for category food 200$, start date and end date of this month".

  **Rules**:
  - Reply in language: ${language}
  - Address each other in the correct role: (e.g, ${styles.map(s => `if you are ${s.title.toLowerCase()}, call each other ${s.call}`)}).
  - If user lacks info, ask for more details.
  - Reply to date/time or expense questions only.
  - For other tasks, say "I'm a demo, can't do that."
  - Always reply under 50 words.
  - After calling a tool, return a short message with a comment and the tool result (e.g., "Here are your wallets: [list]"). Use natural language.
  
  **You have personalities of: (${personalityPrompts})
  
  **Current time is: ${moment().format('YYYY-MM-DD HH:mm:ss')}
  `

  try {
    const token = await extractToken(req)
    const userId = token?._id as string

    // check if user is logged in
    if (!userId) {
      return NextResponse.json({ message: 'Please login to continue' }, { status: 401 })
    }

    const isPremium = checkPremium(token)

    // get messages history from request
    const { messages } = await req.json()
    // get the last 5 messages
    const historyCapacity = 5
    let recentMessages = messages.slice(-historyCapacity)
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

    // Calculate token count
    if (!isPremium) {
      let totalTokens = tokenizer.encode(content).length || 0
      for (const message of recentMessages) {
        if (message.content) {
          totalTokens += tokenizer.encode(message.content).length
        }
      }

      try {
        await connectDatabase()
        const oldSettings = await SettingsModel.findOneAndUpdate(
          { user: userId },
          { $inc: { freeTokensUsed: totalTokens } },
          { new: false }
        )
        // if old settings updatedAt is yesterday, reset freeTokensUsed to 0
        if (oldSettings && moment(oldSettings.updatedAt).isBefore(moment().startOf('day'))) {
          await SettingsModel.updateOne({ user: userId }, { $set: { freeTokensUsed: totalTokens } })
        }
      } catch (error) {
        console.error('Error updating tokens:', error)
      }
    }

    /*
      init: 4125 input tokens
      1. Hello
      2. What can you do?
      3. Show me my wallets
      4. What is the most expensive transaction in this month?
      5. What is the most expensive transaction in last month?
      6. Create transaction for food today I bought dumpling 50000
      7. Today I hangout with my friend, I spent 100000 for food and 50000 for drinks
      8. Show me my expense categories
      9. Show me the latest transactions
      10. Delete the last transaction
      11. Create transaction "Gas refill" $35 for "Gas" category in "Cash" wallet in 23/05/2025
      12. Delete transaction "drinks" $50000
      13. Delete food transaction "$100000"
      14. Create a budget for "transport" $200, start date and end date of next month
      15. Show me my budgets of "transport" for next month
      16. Yesterday I bought a book for $15
      17. Create new invest category name "Index Fund"
      18. Create new invest category name "SSI Fund"
      19. Create new invest category name "DCDS Fund"
      20. Create new saving category name "Oh My God Fund"
      end: 129316
      => spend: 129316 - 4125 = 125191 tokens
      21. Show me my wallets
      22. Show me my saving categories
      23. Show me my invest categories
      24. Add transaction for "Index Fund" $90, start date and end date of next month
      25. Create budget for "Index Fund" category, amount $100, start date and end date of next month
      26. Create budget for "SSI Fund" category, amount $100, start date and end date of next month
      26. Create budget for "DCDS Fund" category, amount $100, start date and end date of next month
      29. Show me all budgets of next month
      30. Delete category "DCDS Fund"
      end: 170689 input tokens
      => spend: 170689 - 129316 = 41373 tokens
      => spend: 170689 - 4125 = 166564 tokens
      166564/30 = 5552 tokens / message
      1739/36 = 48.3 output tokens / message
    */

    /*
      $0.15/1000000 input tokens
      $0.6/1000000 output tokens
      5552 input tokens/message

      super heavy usage: 50 messages/day => 1500 messages/month
      1500 messages/month
      1500 * 5552 = 8328000 input tokens/month
      1500 * 48.3 = 72450 output tokens/month
      => $0.15 * 8328000/1000000 = $1.2492 input tokens/month
      => $0.6 * 72450/1000000 = $0.04347 output tokens/month
      => $1.2492 + $0.04347 = $1.29267 total cost/month
      => $1.29267 * 12 = $15.51204 total cost/year
      => profit (Monthly) = $1.99 - $1.29267 = $0.69733
      => profit (Yearly) = $9.99 - $15.51204 = -$5.52204
    
      heavy usage: 30 messages/day => 900 messages/month
      900 * 5552 = 4996800 input tokens/month
      900 * 48.3 = 43470 output tokens/month
      => $0.15 * 4996800/1000000 = $0.74952 input tokens/month
      => $0.6 * 43470/1000000 = $0.02682 output tokens/month
      => $0.74952 + $0.02682 = $0.77634 total cost/month
      => $0.77634 * 12 = $9.31568 total cost/year
      => profit (Monthly) = $1.99 - $0.77634 = $1.21366
      => profit (Yearly) = $9.99 - $9.31568 = $0.67432

      slight usage: 15 messages/day => 450 messages/month
      450 * 5552 = 2498400 input tokens/month
      450 * 48.3 = 21735 output tokens/month
      => $0.15 * 2498400/1000000 = $0.37476 input tokens/month
      => $0.6 * 21735/1000000 = $0.01304 output tokens/month
      => $0.37476 + $0.01304 = $0.3878 total cost/month
      => $0.3878 * 12 = $4.6536 total cost/year
      => profit = $1.99 - $0.3878 = $1.6022
      => profit (Yearly) = $9.99 - $4.6536 = $5.3364

      light usage: 5 messages/day => 150 messages/month
      150 * 5552 = 832800 input tokens/month
      150 * 48.3 = 7245 output tokens/month
      => $0.15 * 832800/1000000 = $0.12492 input tokens/month
      => $0.6 * 7245/1000000 = $0.00435 output tokens/month
      => $0.12492 + $0.00435 = $0.12927 total cost/month
      => $0.12927 * 12 = $1.55124 total cost/year
      => profit = $1.99 - $0.12927 = $1.86073
      => profit (Yearly) = $9.99 - $1.55124 = $8.43876

      170689 input tokens, 1739 output tokens
      170689 + 1739 = 172428 total tokens
      170689/172428 * 100 = 98.0% input tokens
      1739/172428 * 100 = 1.0% output tokens
    */

    /*
      173947 => 173947 - 170689 = 3258
      176246 => 176246 - 173947 = 2299
      178402 => 178402 - 176246 = 2156
      181625 => 181625 - 178402 = 3223
      184844 => 184844 - 181625 = 3219
      187907 => 187907 - 184844 = 3063
      190853 => 190853 - 187907 = 2946
      193773 => 193773 - 190853 = 2920
      196295 => 196295 - 193773 = 2522
      198597 => 198597 - 196295 = 2302
      200899 => 200899 - 198597 = 2302
      => average: 2741.36 tokens/message
    */

    const result = streamText({
      model: openai('gpt-4o-mini'),
      system: content,
      messages: recentMessages,
      abortSignal: req.signal,
      tools: {
        // Wallet
        get_all_wallets: walletTools.get_all_wallets(userId),
        get_wallet: walletTools.get_wallet(userId),
        create_wallet: walletTools.create_wallet(userId, isPremium),
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
        get_all_budgets: budgetTools.get_all_budgets(userId),
        create_budget: budgetTools.create_budget(userId, isPremium),
        update_budget: budgetTools.update_budget(userId),
        delete_budget: budgetTools.delete_budget(userId),
        // Transaction
        get_all_transactions: transactionTools.get_all_transactions(userId),
        // get_transaction: transactionTools.get_transaction(userId),
        create_transaction: transactionTools.create_transaction(userId),
        update_transaction: transactionTools.update_transaction(userId),
        delete_transaction: transactionTools.delete_transaction(userId),
        get_most_transaction: transactionTools.get_most_transaction(userId),
      },
    })

    return result.toDataStreamResponse({
      headers: {
        'Content-Type': 'application/octet-stream',
        'Content-Encoding': 'none',
      },
    })
  } catch (err: any) {
    return NextResponse.json({ message: err.message || err.error }, { status: 500 })
  }
}
