import { connectDatabase } from '@/config/database'
import UserModel from '@/models/UserModel'
import { NextRequest, NextResponse } from 'next/server'

// Models: User
import '@/models/UserModel'

// [GET]: /admin/user/:id
export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  console.log('- Get User -')

  try {
    const { id } = await params

    // connect to database
    await connectDatabase()

    // get user
    const user = await UserModel.findById(id).lean()

    // check if user not found
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 })
    }

    // return response
    return NextResponse.json({ user }, { status: 200 })
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 })
  }
}
