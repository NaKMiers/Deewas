// Wallet  -------------------------------------

// [GET]: /wallet
export const getMyWalletsApi = async (option: RequestInit = { next: { revalidate: 0 } }) => {
  const res = await fetch('/api/wallet', option)

  // check status
  if (!res.ok) {
    throw new Error((await res.json()).message)
  }

  return await res.json()
}

// [GET]: /wallet/:id
export const getWalletApi = async (
  id: string,
  prefix: string = '',
  option: RequestInit = { next: { revalidate: 0 } }
) => {
  const res = await fetch(`${prefix}/api/wallet/${id}`, option)

  // check status
  if (!res.ok) {
    throw new Error((await res.json()).message)
  }

  return await res.json()
}

// [POST]: /wallet/create
export const createWalletApi = async (data: any) => {
  const res = await fetch('/api/wallet/create', {
    method: 'POST',
    body: JSON.stringify(data),
  })

  // check status
  if (!res.ok) {
    throw new Error((await res.json()).message)
  }

  return await res.json()
}

// [POST]: /wallet/transfer
export const transferFundApi = async (data: any) => {
  const res = await fetch('/api/wallet/transfer', {
    method: 'POST',
    body: JSON.stringify(data),
  })

  // check status
  if (!res.ok) {
    throw new Error((await res.json()).message)
  }

  return await res.json()
}

// [PUT]: /wallet/:id/update
export const updateWalletApi = async (id: string, data: any) => {
  const res = await fetch(`/api/wallet/${id}/update`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })

  // check status
  if (!res.ok) {
    throw new Error((await res.json()).message)
  }

  return await res.json()
}

// [DELETE]: /wallet/:id/delete
export const deleteWalletApi = async (id: string) => {
  const res = await fetch(`/api/wallet/${id}/delete`, {
    method: 'DELETE',
  })

  // check status
  if (!res.ok) {
    throw new Error((await res.json()).message)
  }

  return await res.json()
}
