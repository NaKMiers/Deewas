// Settings -------------------------------------

// [GET]: /settings
export const getMySettingsApi = async (
  query: string = '',
  prefix: string = '',
  option: RequestInit = { next: { revalidate: 0 } }
) => {
  const res = await fetch(`${prefix}/api/settings${query}`, option)

  // check status
  if (!res.ok) {
    throw new Error((await res.json()).message)
  }

  return await res.json()
}

// [GET]: api.exchangerate-api.com/v4/latest/USD
export const getExchangeRatesApi = async (option: RequestInit = { next: { revalidate: 0 } }) => {
  const res = await fetch('https://api.exchangerate-api.com/v4/latest/USD', option)

  // check status
  if (!res.ok) {
    throw new Error((await res.json()).message)
  }

  return await res.json()
}

// [PUT]: /settings/update
export const updateMySettingsApi = async (data: any) => {
  const res = await fetch('/api/settings/update', {
    method: 'PUT',
    body: JSON.stringify(data),
  })

  // check status
  if (!res.ok) {
    throw new Error((await res.json()).message)
  }

  return await res.json()
}

// [DELETE]: /settings/delete-all
export const deleteAllDataApi = async (locale: string) => {
  const res = await fetch('/api/settings/delete-all', {
    method: 'DELETE',
    body: JSON.stringify({ locale }),
  })

  // check status
  if (!res.ok) {
    throw new Error((await res.json()).message)
  }

  return await res.json()
}
