import { getRevenueCatSubscriberApi } from '@/requests'
import { NextRequest, NextResponse } from 'next/server'
import { updateUserPlan } from '.'

// [POST]: /revenuecat-event
export async function POST(req: NextRequest) {
  console.log('- RevenueCat Event - ')

  try {
    // get data from request
    const { event } = await req.json()
    const { app_user_id: userId, type } = event

    if (!userId) {
      return NextResponse.json({ message: 'Invalid user id' }, { status: 400 })
    }

    // VERIFY...
    const data = await getRevenueCatSubscriberApi(userId)

    const activeEntitlement = data.subscriber.entitlements?.['Premium']

    switch (type) {
      case 'INITIAL_PURCHASE':
      case 'RENEWAL':
      case 'PRODUCT_CHANGE':
      case 'UNCANCELLATION':
      case 'SUBSCRIPTION_EXTENDED':
      case 'TEMPORARY_ENTITLEMENT_GRANTED':
      case 'REFUND_REVERSAL':
        // active
        await updateUserPlan(userId, 'active', activeEntitlement)
        break
      case 'CANCELLATION':
      case 'EXPIRATION':
        // inactive
        await updateUserPlan(userId, 'inactive', activeEntitlement)
        break
    }

    // return response
    return NextResponse.json({ message: '' }, { status: 200 })
  } catch (err: any) {
    return NextResponse.json({ message: err.message || err.error }, { status: 500 })
  }
}
