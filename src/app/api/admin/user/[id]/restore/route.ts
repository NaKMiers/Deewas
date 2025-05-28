import { connectDatabase } from '@/config/database'
import UserModel from '@/models/UserModel'
import { NextRequest, NextResponse } from 'next/server'

// Models: User
import '@/models/UserModel'

// [PUT]: /admin/user/:id/restore
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  console.log('- Restore User - ')

  try {
    const { id } = await params

    // connect to database
    await connectDatabase()

    const user = await UserModel.findByIdAndUpdate(id, { $unset: { isDeleted: 1 } }, { new: true })

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({ user, message: 'User restored successfully' }, { status: 200 })
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 })
  }
}
