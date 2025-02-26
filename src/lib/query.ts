export const handleQuery = (
  searchParams: { [key: string]: string[] | string } | undefined,
  prefix: string = ''
): string => {
  let query = prefix + '?'

  // remove empty value
  for (let key in searchParams) {
    if (!searchParams[key]) delete searchParams[key]
  }

  // validate search params
  for (let key in searchParams) {
    // the params that allow only 1 value
    if (Array.isArray(searchParams[key]) && searchParams[key].length > 1) {
      searchParams[key] = searchParams[key].slice(-1)
    }
  }

  // build query
  for (let key in searchParams) {
    // check if key is an array
    if (Array.isArray(searchParams[key])) {
      for (let value of searchParams[key]) {
        query += `${key}=${value}&`
      }
    } else {
      query += `${key}=${searchParams[key]}&`
    }
  }

  // remove all spaces
  query = query.replace(/ /g, '')

  // remove final '&'
  query = query.slice(0, -1)

  return query
}

// valid params
const validParams: string[] = [
  'from-to',
  'active',
  'address',
  'amount',
  'authType',
  'avatar',
  'balance',
  'category',
  'code',
  'date',
  'desc',
  'description',
  'email',
  'firstName',
  'from',
  'deleted',
  'lastName',
  'limit',
  'page',
  'password',
  'paymentMethod',
  'role',
  'search',
  'slug',
  'status',
  'to',
  'type',
  'userId',
  'walletId',
  '_id',
  'createdAt',
  'updatedAt',
]

export const searchParamsToObject = (searchParams: URLSearchParams): { [key: string]: string[] } => {
  // remove all invalid params
  for (let key of Array.from(searchParams.keys())) {
    if (!validParams.includes(key)) searchParams.delete(key)
  }

  const params: { [key: string]: string[] } = {}
  for (let key of Array.from(searchParams.keys())) {
    params[key] = searchParams.getAll(key)
  }

  return params
}
