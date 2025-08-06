import { extractToken } from '@/lib/utils'
import PushTokenModel from '@/models/PushTokenModel'
import { NextRequest, NextResponse } from 'next/server'

// Models: Push Token
import '@/models/PushTokenModel'

// [DELETE]: /push-token/delete
export async function DELETE(req: NextRequest) {
  console.log('- Delete Push Token -')

  try {
    const token = await extractToken(req)
    const userId = token?._id as string

    // check if user is logged in
    if (!userId) {
      return NextResponse.json({ message: 'Please login to continue' }, { status: 401 })
    }

    // get category id form params
    const { token: pushToken } = await req.json()

    console.log('pushToken:', pushToken)

    // delete push token
    await PushTokenModel.deleteOne({
      user: userId,
      token: pushToken,
    })

    return NextResponse.json({ message: 'Push token deleted successfully' }, { status: 200 })
  } catch (err: any) {
    return NextResponse.json({ message: err.message || err.error }, { status: 500 })
  }
}
