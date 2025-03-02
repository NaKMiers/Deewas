import { connectDatabase } from '@/config/database'
import SettingsModel from '@/models/SettingsModel'
import { getToken } from 'next-auth/jwt'
import { NextRequest, NextResponse } from 'next/server'

// Models: Settings
import '@/models/SettingsModel'

// [PUT]: /settings/update
export async function PUT(req: NextRequest) {
  console.log('- Update My Settings -')

  try {
    // connect to database
    await connectDatabase()

    const token = await getToken({ req })
    const userId = token?._id

    // check if user is logged in
    if (!userId) {
      return NextResponse.json({ message: 'Please login to continue' }, { status: 404 })
    }

    // get data from request body
    const { currency, language } = await req.json()

    const set: any = {}

    if (currency) set.currency = currency
    if (language) set.language = language

    // update user settings
    let settings = await SettingsModel.findOneAndUpdate(
      { user: userId },
      { $set: set },
      { new: true }
    ).lean()

    // return response
    return NextResponse.json({ settings, message: '' }, { status: 200 })
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 })
  }
}
