// Budgets  -------------------------------------

// [GET]: /budget
export const getMyBudgetsApi = async (
  query: string = '',
  option: RequestInit = { next: { revalidate: 0 } }
) => {
  const res = await fetch(`/api/budget${query}`, option)

  // check status
  if (!res.ok) {
    throw new Error((await res.json()).message)
  }

  return await res.json()
}

// [POST]: /budget/create
export const createBudgetApi = async (data: any) => {
  const res = await fetch('/api/budget/create', {
    method: 'POST',
    body: JSON.stringify(data),
  })

  // check status
  if (!res.ok) {
    throw new Error((await res.json()).message)
  }

  return await res.json()
}

// [PUT]: /budget/:id/update
export const updateBudgetApi = async (id: string, data: any) => {
  const res = await fetch(`/api/budget/${id}/update`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })

  // check status
  if (!res.ok) {
    throw new Error((await res.json()).message)
  }

  return await res.json()
}

// [DELETE]: /budget/:id/delete
export const deleteBudgetApi = async (id: string) => {
  const res = await fetch(`/api/budget/${id}/delete`, {
    method: 'DELETE',
  })

  // check status
  if (!res.ok) {
    throw new Error((await res.json()).message)
  }

  return await res.json()
}
