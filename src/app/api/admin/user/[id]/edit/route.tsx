import { connectDatabase } from '@/config/database'
import UserModel, { IUser } from '@/models/UserModel'
import { NextRequest, NextResponse } from 'next/server'

// Models: User
import '@/models/UserModel'

// [PUT]: /admin/user/:id/edit
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  console.log('- Edit User -')

  try {
    const { id } = await params

    // connect to database
    await connectDatabase()

    // get user to check exist
    const user: any = await UserModel.findById(id).lean()

    // check user exist
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 })
    }

    // get data to edit user
    const data = await req.json()
    const { username, email }: IUser = data

    // add exist key-value to object
    const set: any = {}
    for (const key in data) {
      // only new value is different from old value will be updated (apply to string, number, boolean fields)
      if (data[key] && data[key] !== user[key]) {
        set[key] = data[key]
      }
    }

    // check duplicate username when username will be changed
    if (set.username) {
      const existUsername = await UserModel.exists({ username })
      if (existUsername) {
        return NextResponse.json(
          { message: 'Username already exists, please try another username' },
          { status: 400 }
        )
      }
    }

    // check duplicate email when username will be changed
    if (set.email) {
      // check duplicate email
      const existEmail = await UserModel.exists({ email })
      if (existEmail) {
        return NextResponse.json(
          { message: 'Email already exists, please try another email' },
          { status: 400 }
        )
      }
    }

    // update user
    await UserModel.findByIdAndUpdate(id, { $set: set })

    // return response
    return NextResponse.json({ message: 'Edit user successfully' }, { status: 200 })
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 })
  }
}
