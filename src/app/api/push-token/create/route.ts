import { connectDatabase } from '@/config/database'
import { extractToken } from '@/lib/utils'
import PushTokenModel from '@/models/PushTokenModel'
import { NextRequest, NextResponse } from 'next/server'

// Models: Push Token
import '@/models/PushTokenModel'

// [POST]: /push-token/create
export async function POST(req: NextRequest) {
  console.log('- Create Push Token -')

  try {
    const token = await extractToken(req)
    const userId = token?._id as string

    // check if user is logged in
    if (!userId) {
      return NextResponse.json({ message: 'Please login to continue' }, { status: 401 })
    }

    // get data from request body
    const {
      token: pushToken,
      locale,
      deviceInfo: { brand, modelName, osName, osVersion },
    } = await req.json()

    if (!pushToken) {
      return NextResponse.json({ message: 'Push token is required' }, { status: 400 })
    }

    // connect to database
    await connectDatabase()

    // get existing token
    const existingToken: any = await PushTokenModel.findOne({ token: pushToken, user: userId }).lean()

    // if token already exists
    if (existingToken) {
      // locale is changed, update it
      if (existingToken.locale !== locale) {
        await PushTokenModel.findByIdAndUpdate(existingToken._id, {
          $set: {
            locale,
            deviceInfo: { brand, modelName, osName, osVersion },
          },
        })
        return NextResponse.json({ message: 'Updated Push Token' }, { status: 200 })
      } else {
        return NextResponse.json({ message: 'Push Token already exists' }, { status: 200 })
      }
    }

    await PushTokenModel.create({
      user: userId,
      token: pushToken,
      locale,
      deviceInfo: { modelName, osName, osVersion },
    })

    // return response
    return NextResponse.json({ message: 'Created Push Token' }, { status: 200 })
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 })
  }
}
