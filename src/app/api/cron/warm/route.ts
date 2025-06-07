import { connectDatabase } from '@/config/database'
import { sendResetPasswordEmail } from '@/lib/sendMail'
import { toUTC } from '@/lib/time'
import { jwtVerify } from 'jose'
import jwt, { JwtPayload } from 'jsonwebtoken'
import moment from 'moment-timezone'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// [GET]: /cron/warm
export async function GET(req: NextRequest) {
  console.log('- CRON Warm -')

  try {
    // get token from query
    const searchParams = req.nextUrl.searchParams
    const authToken = searchParams.get('token')

    if (!authToken) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 400 })
    }
    const { payload: token } = await jwtVerify(
      authToken,
      new TextEncoder().encode(process.env.NEXTAUTH_SECRET)
    )
    const userId = token?._id as string

    // check if user is logged in
    if (!userId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    // warm up serverless functions (/api)
    const [a, b, c] = await Promise.all([
      // [GET]: /api
      fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api`, {
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${authToken}` },
      }),
      // [GET]: /api/transaction/history
      fetch(
        `${process.env.NEXT_PUBLIC_APP_URL}/api/transaction/history?from=${toUTC(moment().startOf('day').toDate())}&to=${toUTC(moment().endOf('day').toDate())}`,
        { headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${authToken}` } }
      ),
      // [GET]: /api/transaction
      fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/transaction`, {
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${authToken}` },
      }),
    ])

    const [INIT, HISTORY, TRANSACTION] = await Promise.all([a.json(), b.json(), c.json()])

    await sendResetPasswordEmail('diwas118151@gmail.com', 'Deewas Cron', 'https://anhkhoa.site')

    return NextResponse.json(
      { warmed: { INIT, HISTORY, TRANSACTION }, token, message: 'Warmed' },
      { status: 200 }
    )
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 })
  }
}
