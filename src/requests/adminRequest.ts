// MARK: USER

// [GET]: /admin/user
export const getAllUsersApi = async (query: string = '') => {
  // no-store to bypass cache
  const res = await fetch(`/api/admin/user${query}`, { cache: 'no-store' })

  // check status
  if (!res.ok) {
    throw new Error((await res.json()).message)
  }

  return await res.json()
}

// [GET]: /admin/user/:id
export const getUserApi = async (userId: string, query: string = '') => {
  // no-store to bypass cache
  const res = await fetch(`/api/admin/user/${userId}${query}`, { cache: 'no-store' })

  // check status
  if (!res.ok) {
    throw new Error((await res.json()).message)
  }

  return await res.json()
}

// [GET]: /admin/user/role-users
export const getRoleUsersApi = async () => {
  // no-store to bypass cache
  const res = await fetch('/api/admin/user/role-users', { cache: 'no-store' })

  // check status
  if (!res.ok) {
    throw new Error((await res.json()).message)
  }

  return await res.json()
}

// [PUT]: /admin/user/:id/edit
export const editUserApi = async (userId: string, data: any) => {
  const res = await fetch(`/api/admin/user/${userId}/edit`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })

  // check status
  if (!res.ok) {
    throw new Error((await res.json()).message)
  }

  return await res.json()
}

// [PUT]: /admin/user/:id/restore
export const restoreUserApi = async (userId: string) => {
  const res = await fetch(`/api/admin/user/${userId}/restore`, {
    method: 'PUT',
  })

  // check status
  if (!res.ok) {
    throw new Error((await res.json()).message)
  }

  return await res.json()
}

// [PUT]: /admin/user/:id/update-plan
export const updatePlanApi = async (userId: string, data: any) => {
  const res = await fetch(`/api/admin/user/${userId}/update-plan`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })

  // check status
  if (!res.ok) {
    throw new Error((await res.json()).message)
  }

  return await res.json()
}

// [DELETE]: /admin/user/:id/delete
export const deleteUsersApi = async (id: string, isForce: boolean = false) => {
  const res = await fetch(`/api/admin/user/${id}/delete`, {
    method: 'DELETE',
    body: JSON.stringify({ isForce }),
  })

  // check status
  if (!res.ok) {
    throw new Error((await res.json()).message)
  }

  return await res.json()
}

// MARK: REFERRAL CODES

// [GET]: /admin/referral-code
export const getAllReferralCodesApi = async (query: string = '') => {
  // no-store to bypass cache
  const res = await fetch(`/api/admin/referral-code${query}`, { cache: 'no-store' })

  // check status
  if (!res.ok) {
    throw new Error((await res.json()).message)
  }

  return await res.json()
}

// [GET]: /admin/referral-code/:code
export const getReferralCodeApi = async (code: string) => {
  // no cache
  const res = await fetch(`/api/admin/referral-code/${code}`, { cache: 'no-store' })

  // check status
  if (!res.ok) {
    throw new Error((await res.json()).message)
  }

  return await res.json()
}

// [POST]: /admin/referral-code/add
export const addReferralCodeApi = async (data: any) => {
  const res = await fetch('/api/admin/referral-code/add', {
    method: 'POST',
    body: JSON.stringify(data),
  })

  // check status
  if (!res.ok) {
    throw new Error((await res.json()).message)
  }

  return await res.json()
}

// [PATCH]: /admin/referral-code/activate
export const activateReferralCodesApi = async (ids: string[], value: boolean) => {
  const res = await fetch('/api/admin/referral-code/activate', {
    method: 'PATCH',
    body: JSON.stringify({ ids, value }),
  })

  // check status
  if (!res.ok) {
    throw new Error((await res.json()).message)
  }

  return await res.json()
}

// [DELETE]: /admin/referral-code/delete
export const deleteReferralCodesApi = async (ids: string[]) => {
  const res = await fetch('/api/admin/referral-code/delete', {
    method: 'DELETE',
    body: JSON.stringify({ ids }),
  })

  // check status
  if (!res.ok) {
    throw new Error((await res.json()).message)
  }

  return await res.json()
}

// MARK: REPORTS
// [GET]: /admin/report
export const getAllReportsApi = async (query: string = '') => {
  // no-store to bypass cache
  const res = await fetch(`/api/admin/report${query}`, { cache: 'no-store' })

  // check status
  if (!res.ok) {
    throw new Error((await res.json()).message)
  }

  return await res.json()
}
