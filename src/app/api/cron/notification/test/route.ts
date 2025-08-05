import { connectDatabase } from '@/config/database'
import { sendPushNotification } from '@/lib/notificationSending'
import { NextRequest, NextResponse } from 'next/server'

// Models: User, Push Token
import '@/models/PushTokenModel'
import '@/models/UserModel'

export const dynamic = 'force-dynamic'

// [GET]: /cron/notification/test
export async function GET(req: NextRequest) {
  console.log('- Test Notification -')

  try {
    await connectDatabase()

    await sendPushNotification(
      'ExponentPushToken[Zx-Az0OMLPi-k3YbM3CKnz]',
      'Hello',
      'This is a test notification'
    )

    return NextResponse.json({ message: 'Personal reminders checked & sent' })
  } catch (err: any) {
    console.error(err)
    return NextResponse.json({ message: err.message }, { status: 500 })
  }
}
