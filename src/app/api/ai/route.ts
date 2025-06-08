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
  - Get one: \`get_transaction\`. Optional: name, amount (opt), type (opt). Ex: "get dumpling 50000".
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
    let recentMessages = messages.slice(-10)
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
        get_transaction: transactionTools.get_transaction(userId),
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
