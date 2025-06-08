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
  // const personalityPrompts = styles.map((s: any) => `"${s.title}": ${s.prompt}`).join(' and ')

  const content = `\
    You're my assistant with the personalities of: ${styles.map(s => `"${s.title}": ${s.prompt}`).join(', ')}.
    Speak in ${language}, using < 50 words per reply.

    Rules:
    - Only answer about time, money, budgets, wallets, categories, and transactions.
    - If info is missing, ask me.
    - If you can't do something, say: "I'm a demo, can't do that."
    - Follow role tone: ${styles.map(s => `${s.title} speaks like "${s.call}"`).join(', ')}.

    Current time: ${moment().format('YYYY-MM-DD HH:mm:ss')}
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

    let totalTokens = tokenizer.encode(content).length || 0
    for (const message of recentMessages) {
      if (message.content) {
        totalTokens += tokenizer.encode(message.content).length
      }
    }
    console.log('Total tokens:', totalTokens)

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
