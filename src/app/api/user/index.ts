import { connectDatabase } from '@/config/database'
import UserModel from '@/models/UserModel'

// Models: User
import '@/models/UserModel'

type DefaultsType = {
  skip: number
  limit: number
  filter: { [key: string]: any }
  sort: { [key: string]: any }
}

// MARK: Filter Builder
const filterBuilder = (
  params: any,
  defaults: DefaultsType = {
    skip: 0,
    limit: Infinity,
    sort: {},
    filter: {},
  }
) => {
  // options
  let skip = defaults.skip
  let limit = defaults.limit
  const filter: { [key: string]: any } = defaults.filter
  let sort: { [key: string]: any } = defaults.sort

  // build filter
  for (const key in params) {
    const values = params[key]

    if (params.hasOwnProperty(key)) {
      // Special Cases ---------------------
      if (key === 'limit') {
        limit = +values[0]
        continue
      }

      if (key === 'page') {
        // page only works when limit is set
        if (limit === Infinity) {
          continue
        }

        const page = +values[0]
        skip = (page - 1) * limit
        continue
      }

      if (key === 'search') {
        const searchFields = ['username', 'email', 'authType', 'role', 'firstName', 'lastName']

        filter.$or = searchFields.map(field => ({
          [field]: { $regex: values[0], $options: 'i' },
        }))
        continue
      }

      if (key === 'sort') {
        values.forEach((value: string) => {
          sort[value.split('|')[0]] = +value.split('|')[1]
        })

        continue
      }

      // Normal Cases ---------------------
      filter[key] = values.length === 1 ? values[0] : { $in: values }
    }
  }

  return { filter, sort, limit, skip }
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
