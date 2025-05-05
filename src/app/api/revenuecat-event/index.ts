import { connectDatabase } from '@/config/database'
import { toUTC } from '@/lib/time'
import UserModel from '@/models/UserModel'
import moment from 'moment-timezone'

// Models: User
import '@/models/UserModel'

export const updateUserPlan = async (
  userId: string,
  status: 'active' | 'inactive',
  activeEntitlement: any,
  platform?: string
) => {
  try {
    // connect to database
    await connectDatabase()

    const { product_identifier, expires_date } = activeEntitlement
    const set: any = {} // plan, planExpiredAt, purchased
    if (platform) set.purchasedAtPlatform = platform

    if (status === 'active') {
      switch (product_identifier) {
        case 'deewas_199_1m_1w0':
          set.plan = 'premium-monthly'
          set.planExpiredAt = toUTC(moment(expires_date).toDate())
          break
        case 'deewas_999_1y_1w0':
          set.plan = 'premium-yearly'
          set.planExpiredAt = toUTC(moment(expires_date).toDate())
          break
        case 'deewas_2499_lifetime':
          set.plan = 'premium-lifetime'
          set.planExpiredAt = null
          break
      }
    } else {
      set.plan = 'free'
      set.planExpiredAt = null
    }

    console.log('set', set)

    // update user
    const user: any = await UserModel.findByIdAndUpdate(userId, { $set: set }, { new: true }).lean()

    if (!user) {
      throw { errorCode: 'USER_NOT_FOUND', message: 'User not found' }
    }

    return user
  } catch (err: any) {
    throw err
  }
}
