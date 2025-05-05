import { extractToken } from '@/lib/utils'
import { NextRequest, NextResponse } from 'next/server'
import { getSettings } from '.'

export const dynamic = 'force-dynamic'

// [GET]: /settings
export async function GET(req: NextRequest) {
  console.log('- Get My Settings -')

  try {
    const token = await extractToken(req)
    let userId = token?._id as string

    if (!userId) {
      return NextResponse.json({ message: 'Please login to continue' }, { status: 404 })
    }

    const response = await getSettings(userId)

    // return response
    return NextResponse.json(response, { status: 200 })
  } catch (err: any) {
    return NextResponse.json({ message: err.message || err.error }, { status: 500 })
  }
}
