import { connectDatabase } from '@/config/database'
import PushTokenModel from '@/models/PushTokenModel'
import { NextRequest, NextResponse } from 'next/server'

// Models: Push Token
import '@/models/PushTokenModel'

export const dynamic = 'force-dynamic'

// [GET]: /admin/push-token/:userId
export async function GET(req: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  console.log('- Get User Push Tokens -')

  try {
    const { userId } = await params

    // check if userId is provided
    if (!userId) {
      return NextResponse.json({ message: 'User ID is required' }, { status: 400 })
    }

    // connect to database
    await connectDatabase()

    // get push tokens of user
    const pushTokens = await PushTokenModel.find({ user: userId }).lean()

    // return push tokens
    return NextResponse.json({ pushTokens, message: 'Push tokens are here' }, { status: 200 })
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 })
  }
}
