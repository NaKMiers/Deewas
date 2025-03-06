import { connectDatabase } from '@/config/database'
import UserModel from '@/models/UserModel'
import { getToken } from 'next-auth/jwt'
import { NextRequest, NextResponse } from 'next/server'

// Models: User
import '@/models/UserModel'

// [PUT]: /user/update
export async function PUT(req: NextRequest) {
  console.log('- Update User - ')

  try {
    const token = await getToken({ req })
    const userId = token?._id as string

    // check if user is logged in
    if (!userId) {
      return NextResponse.json({ message: 'Please login to continue' }, { status: 401 })
    }

    // get date from request body
    const data = await req.json()
    const response = await updateUser(userId, data)

    // return response
    return NextResponse.json(response, { status: 200 })
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 })
  }
}

export const updateUser = async (userId: string, data: any) => {
  try {
    // connect to database
    await connectDatabase()

    const { initiated } = data
    const set: any = {}
    if (initiated) set.initiated = initiated

    // update user
    await UserModel.findByIdAndUpdate(userId, { $set: set })

    return { message: 'User updated' }
  } catch (err: any) {
    throw new Error(err)
  }
}
