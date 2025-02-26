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
