import { toUTC } from '@/lib/time'
import moment from 'moment-timezone'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const endlessOwnerToken =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2N2M2ODgxMzM5YWE5NjczNzUwZDYwMTIiLCJlbWFpbCI6ImRpd2FzMTE4MTUxQGdtYWlsLmNvbSIsImF1dGhUeXBlIjoiZ29vZ2xlIiwicm9sZSI6ImFkbWluIiwiYXZhdGFyIjoiaHR0cHM6Ly9saDMuZ29vZ2xldXNlcmNvbnRlbnQuY29tL2EvQUNnOG9jTHVSdkNEQUNJYkxudHhEOWxxcUtnMkIyRFdDLVFhTjFraVBnUmlDY2daUkJudy1EeVN0Zz1zOTYtYyIsImZpcnN0TmFtZSI6IlBpIiwibGFzdE5hbWUiOiJQaSIsInVzZXJuYW1lIjoiZGl3YXMxMTgxNTEiLCJjcmVhdGVkQXQiOiIyMDI1LTAzLTA0VDA0OjU2OjUxLjA4N1oiLCJ1cGRhdGVkQXQiOiIyMDI1LTA2LTA3VDA0OjU4OjUzLjM3MVoiLCJfX3YiOjAsImluaXRpYXRlZCI6dHJ1ZSwibmFtZSI6IlBpIFBpIiwicGxhbiI6ImZyZWUiLCJwbGFuRXhwaXJlZEF0IjpudWxsLCJwdXJjaGFzZWRBdFBsYXRmb3JtIjoiaW9zIiwiaWF0IjoxNzQ5Mjg1MjA0fQ.KDMHPyvR8RGJf9GPQzkBsfxAyqQcztzHSE0JnyoEAvU'

// [GET]: /cron/warm
export async function GET(req: NextRequest) {
  console.log('- CRON Warm -')

  try {
    // warm up serverless functions (/api)
    const [a, b, c] = await Promise.all([
      // [GET]: /api
      fetch(`https://deewas.com/api`, {
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${endlessOwnerToken}` },
      }),
      // [GET]: /api/transaction/history
      fetch(
        `https://deewas.com/api/transaction/history?from=${toUTC(moment().startOf('day').toDate())}&to=${toUTC(moment().endOf('day').toDate())}`,
        { headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${endlessOwnerToken}` } }
      ),
      // [GET]: /api/transaction
      fetch(`https://deewas.com/api/transaction`, {
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${endlessOwnerToken}` },
      }),
    ])

    const [INIT, HISTORY, TRANSACTION] = await Promise.all([a.json(), b.json(), c.json()])

    return NextResponse.json(
      {
        warmed: { INIT: Boolean(INIT), HISTORY: Boolean(HISTORY), TRANSACTION: Boolean(TRANSACTION) },
        message: 'Warmed',
      },
      { status: 200 }
    )
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 })
  }
}
