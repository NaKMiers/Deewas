import { connectDatabase } from '@/config/database'
import UserModel from '@/models/UserModel'

// Models: User
import '@/models/UserModel'

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
