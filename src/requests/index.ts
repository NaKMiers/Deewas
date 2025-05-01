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
