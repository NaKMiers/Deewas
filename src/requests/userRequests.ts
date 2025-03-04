// User  -------------------------------------

// [PUT]: /user/update
export const updateUserApi = async (data: any) => {
  const res = await fetch('/api/user/update', {
    method: 'PUT',
    body: JSON.stringify(data),
  })

  // check status
  if (!res.ok) {
    throw new Error((await res.json()).message)
  }

  return await res.json()
}
