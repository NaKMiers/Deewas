import { extractToken } from '@/lib/utils'
import { NextRequest, NextResponse } from 'next/server'
import { deleteAllData } from '..'

// [DELETE]: /settings/delete-all
export async function DELETE(req: NextRequest) {
  console.log('- Delete All Data -')

  try {
    const token = await extractToken(req)
    const userId = token?._id as string

    // check if user is logged in
    if (!userId) {
      return NextResponse.json({ message: 'Please login to continue' }, { status: 404 })
    }

    // get locale from request body
    let { locale } = await req.json()
    locale = locale || 'en'

    const response = await deleteAllData(userId, locale)

    // return response
    return NextResponse.json(response, { status: 200 })
  } catch (err: any) {
    return NextResponse.json({ message: err.message || err.error }, { status: 500 })
  }
}
