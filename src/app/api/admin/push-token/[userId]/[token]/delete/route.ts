import { connectDatabase } from '@/config/database'
import PushTokenModel from '@/models/PushTokenModel'
import { NextRequest, NextResponse } from 'next/server'

// Models: Push Token
import '@/models/PushTokenModel'

// [DELETE]: /admin/push-token/:userId/:token/delete
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string; token: string }> }
) {
  console.log('- Delete User Token -')

  try {
    // get userId and token from params
    const { userId, token } = await params

    if (!userId || !token) {
      return NextResponse.json({ message: 'User ID and Token are required' }, { status: 400 })
    }

    // connect to database
    await connectDatabase()

    // delete push token
    const deletedToken = await PushTokenModel.findOneAndDelete({ user: userId, token }, { new: true })

    if (!deletedToken) {
      return NextResponse.json({ message: 'Token not found or already deleted' }, { status: 404 })
    }

    // return response
    return NextResponse.json({ message: 'Token Deleted Successfully' }, { status: 200 })
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 })
  }
}
