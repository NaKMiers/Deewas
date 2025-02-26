import { currencies } from '@/constants/currencies'
import { IUser } from '@/models/UserModel'

export const shortName = (user: IUser) => {
  if (user?.firstName && user?.lastName) {
    return `${user.firstName} ${user.lastName}`
  }
  if (user?.firstName) {
    return user.firstName
  }
  if (user?.lastName) {
    return user.lastName
  }
  if (user?.username) {
    return user.username
  }
  if (user?.email) {
    return user.email.split('@')[0]
  }
}

export const formatSymbol = (currency: string): string =>
  currencies.find(c => c.value === currency)?.symbol || ''

export const formatCurrency = (
  currency: string,
  amount: number,
  rate: number,
  isSymbol: boolean = true
): string => {
  let result = ''
  if (isSymbol) {
    result += formatSymbol(currency) + ' '
  }
  result += (amount * rate).toFixed(2)
  return result
}

export const formatPrice = (price: number = 0) => {
  return Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price)
}

export const capitalize = (str: string) => {
  return str.charAt(0).toUpperCase() + str.slice(1)
}
