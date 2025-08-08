// Push Token  -------------------------------------

// [GET]: /admin/push-token/:userId
export const getUserPushTokensApi = async (
  userId: string,
  query: string = '',
  option: RequestInit = { next: { revalidate: 0 } }
) => {
  const res = await fetch(`/api/admin/push-token/${userId}${query}`, option)

  // check status
  if (!res.ok) {
    throw new Error((await res.json()).message)
  }

  return await res.json()
}

// [POST]: /admin/push-token/:userId/notify
export const sendPushNotificationApi = async (
  userId: string,
  tokens: string[],
  data: { title: string; subtitle?: string; body: string }
) => {
  const res = await fetch(`/api/admin/push-token/${userId}/notify`, {
    method: 'POST',
    body: JSON.stringify({ ...data, tokens }),
  })

  // check status
  if (!res.ok) {
    throw new Error((await res.json()).message)
  }

  return await res.json()
}

// [DELETE]: /admin/push-token/:userId/:token/delete
export const deleteUserPushTokenApi = async (userId: string, token: string) => {
  const res = await fetch(`/api/admin/push-token/${userId}/${token}/delete`, {
    method: 'DELETE',
  })

  // check status
  if (!res.ok) {
    throw new Error((await res.json()).message)
  }

  return await res.json()
}
