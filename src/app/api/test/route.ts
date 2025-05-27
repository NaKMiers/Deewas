import { connectDatabase } from '@/config/database'
import { NextRequest, NextResponse } from 'next/server'

// [TEST]: /test
export async function GET(req: NextRequest) {
  console.log('Test API')

  try {
    // connect to database
    await connectDatabase()

    // return response
    return NextResponse.json({ message: '' }, { status: 200 })
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 })
  }
}
