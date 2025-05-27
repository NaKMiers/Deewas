import { connectDatabase } from '@/config/database'
import UserModel from '@/models/UserModel'
import { NextResponse } from 'next/server'

// Models: User
import '@/models/UserModel'

export const dynamic = 'force-dynamic'

// [GET]: /admin/user/role-users
export async function GET() {
  console.log('- Get Role-Users -')

  try {
    // connect to database
    await connectDatabase()

    // get special role users from database
    let roleUsers = await UserModel.find({
      role: { $in: ['admin', 'collaborator'] },
    }).lean()

    // group admins, collaborators
    const admins = roleUsers.filter(user => user.role === 'admin')
    const collaborators = roleUsers.filter(user => user.role === 'collaborator')

    roleUsers = [...admins, ...collaborators]

    // return collaborators, admins,
    return NextResponse.json({ roleUsers, message: 'Role-users are here' }, { status: 200 })
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 })
  }
}
