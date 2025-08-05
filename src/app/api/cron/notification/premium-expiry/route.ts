import { connectDatabase } from '@/config/database'
import { getMessagesByLocale } from '@/constants/categories'
import { sendPushNotification } from '@/lib/notificationSending'
import PushTokenModel from '@/models/PushTokenModel'
import UserModel from '@/models/UserModel'
import moment from 'moment-timezone'
import { createTranslator } from 'next-intl'
import { NextRequest, NextResponse } from 'next/server'

// Models: User, Push Token
import '@/models/PushTokenModel'
import '@/models/UserModel'

export const dynamic = 'force-dynamic'

// Target time to send (09:00 local time)
const TARGET_HOUR = 9
const TARGET_MINUTE = 0
const TIME_TOLERANCE = 10 // minutes

// [CRON]: 0 * * * * -> every hour at minute 0
// [GET]: /cron/notification/premium-expiry
export async function GET(req: NextRequest) {
  console.log('- Cron: Premium Expiry Reminder -')

  try {
    await connectDatabase()

    // Get all active premium users
    const users = await UserModel.find({
      isDeleted: { $ne: true },
      plan: { $ne: 'free' },
      planExpiredAt: { $exists: true, $ne: null },
    }).lean()

    for (const user of users) {
      const tz = user.timezone || 'UTC'
      const nowLocal = moment.tz(tz)

      // Check if current time is within tolerance of target send time
      const targetTime = moment.tz(tz).hour(TARGET_HOUR).minute(TARGET_MINUTE).second(0)
      const diffMinutes = Math.abs(nowLocal.diff(targetTime, 'minutes'))
      if (diffMinutes > TIME_TOLERANCE) continue

      // days left until expiry
      const daysLeft = moment(user.planExpiredAt)
        .startOf('day')
        .diff(nowLocal.clone().startOf('day'), 'days')

      // Only trigger on exact match
      if (![3, 1, 0].includes(daysLeft)) continue

      let title = ''
      let body = ''

      if (daysLeft === 3) {
        title = 'Only 3 days of Premium left'
        body = 'Enjoy all Premium benefits now and renew to keep your experience going'
      } else if (daysLeft === 1) {
        title = 'Premium ends tomorrow'
        body = 'Renew today to keep enjoying all your favorite Premium features'
      } else if (daysLeft === 0) {
        title = 'Premium has ended'
        body = 'Renew anytime to continue enjoying the full Premium experience'
      }

      // Send to all devices of the user
      const pushTokens = await PushTokenModel.find({ user: user._id }).lean()
      for (const tokenObj of pushTokens) {
        const locale = tokenObj?.locale || 'en'
        const messages = getMessagesByLocale(locale)
        const t = createTranslator({ locale, messages, namespace: 'notification' })

        await sendPushNotification(tokenObj.token, t(title), t(body))
      }
    }

    return NextResponse.json({ message: 'Premium expiry reminders checked & sent' })
  } catch (err: any) {
    console.error(err)
    return NextResponse.json({ message: err.message }, { status: 500 })
  }
}
