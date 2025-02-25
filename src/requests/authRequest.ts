// Auth -------------------------------------

// [POST]: /auth/register
export const registerApi = async (data: any) => {
  const res = await fetch('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(data),
  })

  // check status
  if (!res.ok) {
    throw new Error((await res.json()).message)
  }

  return await res.json()
}
