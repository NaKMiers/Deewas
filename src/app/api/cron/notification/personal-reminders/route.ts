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

// fixed times for reminders
const FIXED_TIMES = [
  {
    hour: 8,
    minute: 0,
    title: 'Good morning ☀️',
    body: 'Start your day by noting your morning expenses to stay on track 📝',
  },
  {
    hour: 21,
    minute: 0,
    title: 'Good evening 🌙',
    body: 'Wrap up your day by recording what you spent today 📒',
  },
]

// time tolerance in minutes
const TIME_TOLERANCE = 10 // minutes

// [CRON]: 0 * * * * -> every hour at 0 minutes
// [GET]: /cron/notification/personal-reminders
export async function GET(req: NextRequest) {
  console.log('- Cron: Personal Reminders -')

  try {
    await connectDatabase()

    const users = await UserModel.find({ isDeleted: { $ne: true } }).lean()

    for (const user of users) {
      const tz = user.timezone || 'UTC'
      const nowLocal = moment.tz(tz)

      for (const timeObj of FIXED_TIMES) {
        const targetTime = moment.tz(tz).hour(timeObj.hour).minute(timeObj.minute).second(0)
        const diffMinutes = Math.abs(nowLocal.diff(targetTime, 'minutes'))
        if (diffMinutes > TIME_TOLERANCE) continue

        // get push tokens of the user
        const pushTokens = await PushTokenModel.find({ user: user._id }).lean()
        for (const tokenObj of pushTokens) {
          const locale = tokenObj?.locale || 'en'
          const messages = getMessagesByLocale(locale)
          const t = createTranslator({ locale, messages, namespace: 'notification' })

          await sendPushNotification(tokenObj.token, t(timeObj.title), t(timeObj.body))
        }
      }
    }

    return NextResponse.json({ message: 'Personal reminders checked & sent' })
  } catch (err: any) {
    console.error(err)
    return NextResponse.json({ message: err.message }, { status: 500 })
  }
}
