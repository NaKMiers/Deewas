import { currencies } from '@/constants/currencies'
import { IUser } from '@/models/UserModel'
import {
  LucideChartNoAxesCombined,
  LucideHandCoins,
  LucideTrendingDown,
  LucideTrendingUp,
  LucideWalletCards,
} from 'lucide-react'

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

// MARK: Transaction Display Options
export const tranOptions = {
  income: {
    Icon: LucideTrendingUp,
    color: 'text-emerald-500',
    background: 'bg-emerald-950',
    border: 'border-emerald-500',
  },
  expense: {
    Icon: LucideTrendingDown,
    color: 'text-rose-500',
    background: 'bg-rose-900',
    border: 'border-rose-500',
  },
  saving: {
    Icon: LucideHandCoins,
    color: 'text-yellow-500',
    background: 'bg-yellow-950',
    border: 'border-yellow-500',
  },
  invest: {
    Icon: LucideChartNoAxesCombined,
    color: 'text-violet-500',
    background: 'bg-violet-950',
    border: 'border-violet-500',
  },
  balance: {
    Icon: LucideWalletCards,
    color: 'text-sky-500',
    background: 'bg-sky-950',
    border: 'border-sky-500',
  },
}

type TranOptionKeys = keyof typeof tranOptions
export const checkTranType = (type: TranOptionKeys) => {
  const results = tranOptions[type]
  return results || tranOptions['balance']
}
