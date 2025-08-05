import { connectDatabase } from '@/config/database'
import { getMessagesByLocale } from '@/constants/categories'
import { sendPushNotification } from '@/lib/notificationSending'
import PushTokenModel from '@/models/PushTokenModel'
import TransactionModel from '@/models/TransactionModel'
import UserModel from '@/models/UserModel'
import moment from 'moment-timezone'
import { createTranslator } from 'next-intl'
import { NextRequest, NextResponse } from 'next/server'

// Models: User, Transaction, Push Token
import '@/models/PushTokenModel'
import '@/models/TransactionModel'
import '@/models/UserModel'

export const dynamic = 'force-dynamic'

// remind days
const REMIND_DAYS = [1, 3, 7, 10, 14, 21, 30, 45, 60]

// [CRON]: 30 * * * * -> every hour at 30 minutes
// [GET]: /cron/notification/remind-transactions
export async function GET(req: NextRequest) {
  console.log('- Cron: Remind Transactions -')

  try {
    // connect to database
    await connectDatabase()

    // get all users
    const users = await UserModel.find({ isDeleted: { $ne: true } }).lean()

    for (const user of users) {
      const tz = user.timezone || 'UTC'
      const nowLocal = moment.tz(tz)

      const targetTime = moment.tz(tz).hour(18).minute(30).second(0) // 18:30
      const diffMinutes = Math.abs(nowLocal.diff(targetTime, 'minutes'))
      if (diffMinutes > 10) continue

      // find the last transaction of the user
      const lastTx: any = await TransactionModel.findOne({ user: user._id }).sort({ date: -1 }).lean()
      if (!lastTx) continue

      const lastTxDate = moment.tz(lastTx.date, tz).startOf('day')
      const daysDiff = nowLocal.startOf('day').diff(lastTxDate, 'days')

      if (REMIND_DAYS.includes(daysDiff)) {
        // get push tokens of the user
        const pushTokens = await PushTokenModel.find({ user: user._id }).lean()
        for (const tokenObj of pushTokens) {
          const locale = tokenObj.locale || 'en'
          const messages = getMessagesByLocale(locale)
          const t = createTranslator({ locale, messages, namespace: 'notification' })

          await sendPushNotification(
            tokenObj.token,
            t("Don't forget to track your expenses"),
            t(`It's been ${daysDiff} days since your last transaction`)
          )
        }
      }
    }

    return NextResponse.json({ message: 'Reminders checked & sent' })
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 })
  }
}
