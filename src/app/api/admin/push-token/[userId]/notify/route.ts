import { connectDatabase } from '@/config/database'
import { NextRequest, NextResponse } from 'next/server'

// Models: Push Token
import { sendPushNotification } from '@/lib/notificationSending'
import '@/models/PushTokenModel'

// [POST]: /admin/push-token/:userId/notify
export async function POST(req: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  console.log('- Send Push Notification to User -')

  try {
    const { userId } = await params

    // check if userId is provided
    if (!userId) {
      return NextResponse.json({ message: 'User ID is required' }, { status: 400 })
    }

    // get data from request
    const { title, subTitle, body, tokens: pushTokens } = await req.json()

    // connect to database
    await connectDatabase()

    await Promise.all(
      pushTokens.map((token: string) => sendPushNotification(token, title, body, subTitle))
    )

    // return push tokens
    return NextResponse.json({ pushTokens, message: 'Notification sent successfully' }, { status: 200 })
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 })
  }
}
