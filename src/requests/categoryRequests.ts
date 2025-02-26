// Category  -------------------------------------

// [GET]: /category
export const getMyCategoriesApi = async (option: RequestInit = { next: { revalidate: 0 } }) => {
  const res = await fetch('/api/category', option)

  // check status
  if (!res.ok) {
    throw new Error((await res.json()).message)
  }

  return await res.json()
}

// [POST]: /category/create
export const createCategoryApi = async (data: any) => {
  const res = await fetch('/api/category/create', {
    method: 'POST',
    body: JSON.stringify(data),
  })

  // check status
  if (!res.ok) {
    throw new Error((await res.json()).message)
  }

  return await res.json()
}

// [PUT]: /category/:id/update
export const updateCategoryApi = async (id: string, data: any) => {
  const res = await fetch(`/api/category/${id}/update`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })

  // check status
  if (!res.ok) {
    throw new Error((await res.json()).message)
  }

  return await res.json()
}

// [DELETE]: /category/:id/delete
export const deleteCategoryApi = async (id: string) => {
  const res = await fetch(`/api/category/${id}/delete`, {
    method: 'DELETE',
  })

  // check status
  if (!res.ok) {
    throw new Error((await res.json()).message)
  }

  return await res.json()
}
