// Transaction  -------------------------------------

// [GET]: /transaction
export const getMyTransactionsApi = async (
  query: string = '',
  option: RequestInit = { next: { revalidate: 0 } }
) => {
  const res = await fetch(`/api/transaction${query}`, option)

  // check status
  if (!res.ok) {
    throw new Error((await res.json()).message)
  }

  return await res.json()
}

// [GET]: /transaction/history
export const getHistoryApi = async (
  query: string = '',
  prefix: string = '',
  option: RequestInit = { next: { revalidate: 0 } }
) => {
  const res = await fetch(`${prefix}/api/transaction/history${query}`, option)

  // check status
  if (!res.ok) {
    throw new Error((await res.json()).message)
  }

  return await res.json()
}

// [POST]: /transaction/create
export const createTransactionApi = async (data: any) => {
  const res = await fetch('/api/transaction/create', {
    method: 'POST',
    body: JSON.stringify(data),
  })

  // check status
  if (!res.ok) {
    throw new Error((await res.json()).message)
  }

  return await res.json()
}

// [PUT]: /transaction/:id/update
export const updateTransactionApi = async (id: string, data: any) => {
  const res = await fetch(`/api/transaction/${id}/update`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })

  // check status
  if (!res.ok) {
    throw new Error((await res.json()).message)
  }

  return await res.json()
}

// [DELETE]: /transaction/:id/delete
export const deleteTransactionApi = async (id: string) => {
  const res = await fetch(`/api/transaction/${id}/delete`, {
    method: 'DELETE',
  })

  // check status
  if (!res.ok) {
    throw new Error((await res.json()).message)
  }

  return await res.json()
}
