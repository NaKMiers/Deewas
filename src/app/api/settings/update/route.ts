import { extractToken } from '@/lib/utils'
import { NextRequest, NextResponse } from 'next/server'
import { updateSettings } from '..'

// [PUT]: /settings/update
export async function PUT(req: NextRequest) {
  console.log('- Update My Settings -')

  try {
    const token = await extractToken(req)
    const userId = token?._id as string

    // check if user is logged in
    if (!userId) {
      return NextResponse.json({ message: 'Please login to continue' }, { status: 404 })
    }

    // get data from request body
    const { currency, language, personalities } = await req.json()

    const response = await updateSettings(userId, {
      currency,
      language,
      personalities,
    })

    // return response
    return NextResponse.json(response, { status: 200 })
  } catch (err: any) {
    return NextResponse.json({ message: err.message || err.error }, { status: 500 })
  }
}
