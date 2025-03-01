import { connectDatabase } from '@/config/database'
import SettingsModel from '@/models/SettingsModel'
import { NextRequest, NextResponse } from 'next/server'

// Models: Settings
import '@/models/SettingsModel'
import { getToken } from 'next-auth/jwt'

export const dynamic = 'force-dynamic'

// [GET]: /settings
export async function GET(req: NextRequest) {
  console.log('- Get My Settings -')

  try {
    // connect to database
    await connectDatabase()

    const token = await getToken({ req })
    let userId = token?._id

    if (!userId) {
      return NextResponse.json({ message: 'Please login to continue' }, { status: 404 })
    }

    // get user settings
    const settings = await SettingsModel.findOne({ user: userId }).lean()

    if (!settings) {
      return NextResponse.json({ message: 'Settings not found' }, { status: 404 })
    }

    // return response
    return NextResponse.json({ settings, message: 'Settings are here' }, { status: 200 })
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 })
  }
}
