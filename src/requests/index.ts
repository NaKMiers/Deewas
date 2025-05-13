// Auth
export * from './authRequest'

// Wallet
export * from './walletRequests'

// Category
export * from './categoryRequests'

// Settings
export * from './settingsRequests'

// User
export * from './userRequests'

// Transaction
export * from './transactionRequests'

export const getRevenueCatSubscriberApi = async (userId: string) => {
  const res = await fetch(`https://api.revenuecat.com/v1/subscribers/${userId}`, {
    headers: {
      Authorization: `Bearer ${process.env.REVENUECAT_SECRET_KEY}`,
    },
  })

  if (!res.ok) throw new Error('Failed to verify user')

  return await res.json()
}

// [POST]: /api/support
export const sendSupportFormApi = async (data: any) => {
  const res = await fetch('/api/support', {
    method: 'POST',
    body: JSON.stringify(data),
  })

  if (!res.ok) new Error((await res.json()).message)

  return await res.json()
}

// [GET]: /
export const initApi = async () => {
  const res = await fetch('/api')

  // check status
  if (!res.ok) throw await res.json()

  return await res.json()
}
