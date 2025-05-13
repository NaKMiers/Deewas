import { connectDatabase } from '@/config/database'
import ReportModel from '@/models/ReportModel'
import { NextRequest, NextResponse } from 'next/server'

// Models: Report
import '@/models/ReportModel'

export async function POST(req: NextRequest) {
  console.log('- Add Report -')

  try {
    // get results from request
    const { results } = await req.json()

    // connect to database
    await connectDatabase()

    // create report
    await ReportModel.create({ results })

    // return response
    return NextResponse.json({ message: 'Created report' }, { status: 200 })
  } catch (err: any) {
    return NextResponse.json({ message: err.message || err.error }, { status: 500 })
  }
}
