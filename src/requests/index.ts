// Auth
export * from './authRequest'

// Wallet
export * from './walletRequests'

// Category
export * from './categoryRequests'

// Settings
export * from './settingsRequests'

// [GET]: /
export const getHistoryApi = async (
  query: string = '',
  prefix: string = '',
  option: RequestInit = { next: { revalidate: 0 } }
) => {
  const res = await fetch(`${prefix}/api${query}`, option)

  // check status
  if (!res.ok) {
    throw new Error((await res.json()).message)
  }

  return await res.json()
}
