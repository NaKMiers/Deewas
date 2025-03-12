import { currencies } from '@/constants/settings'
import { IUser } from '@/models/UserModel'
import {
  LucideArrowRightLeft,
  LucideChartNoAxesCombined,
  LucideForward,
  LucideHandCoins,
  LucideTrendingDown,
  LucideTrendingUp,
  LucideWalletCards,
} from 'lucide-react'
import * as locales from 'date-fns/locale'

export const shortName = (user: IUser) => {
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
  return 'User'
}

export const formatSymbol = (currency: string): string =>
  currencies.find(c => c.value === currency)?.symbol || ''

export const formatCurrency = (currency: string, amount: number): string => {
  const locale = currencies.find(c => c.value === currency)?.locale || 'en-US'

  const formattedAmount = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
    currencyDisplay: 'symbol',
  }).format(amount)

  return formattedAmount
}

export function parseCurrency(currency: string): number {
  return Number(currency.replace(/\D+/g, ''))
}

export const formatPrice = (price: number = 0) => {
  return Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price)
}

export function formatCompactNumber(num: number | string, isCurrency: boolean = false): string {
  if (isCurrency && typeof num === 'string') {
    return new Intl.NumberFormat('vi-VN', { notation: 'compact' }).format(parseCurrency(num))
  }

  return new Intl.NumberFormat('en', { notation: 'compact' }).format(num as number)
}

export const getLocale = (locale: string): locales.Locale => {
  return (locales as Record<string, locales.Locale>)[locale] || locales.enUS
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
    hex: '#10b981',
  },
  expense: {
    Icon: LucideTrendingDown,
    color: 'text-rose-500',
    background: 'bg-rose-900',
    border: 'border-rose-500',
    hex: '#f43f5e',
  },
  saving: {
    Icon: LucideHandCoins,
    color: 'text-yellow-500',
    background: 'bg-yellow-950',
    border: 'border-yellow-500',
    hex: '#eab308',
  },
  invest: {
    Icon: LucideChartNoAxesCombined,
    color: 'text-violet-500',
    background: 'bg-violet-950',
    border: 'border-violet-500',
    hex: '#8b5cf6',
  },
  balance: {
    Icon: LucideWalletCards,
    color: 'text-sky-500',
    background: 'bg-sky-950',
    border: 'border-sky-500',
    hex: '#0ea5e9',
  },
  transfer: {
    Icon: LucideArrowRightLeft,
    color: 'text-indigo-500',
    background: 'bg-indigo-950',
    border: 'border-indigo-500',
    hex: '#6366f1',
  },
}

type TranOptionKeys = keyof typeof tranOptions
export const checkTranType = (type: TranOptionKeys) => {
  const results = tranOptions[type]
  return results || tranOptions['balance']
}

const levels = {
  hard: {
    background: 'bg-rose-500',
  },
  medium: {
    background: 'bg-yellow-500',
  },
  easy: {
    background: 'bg-emerald-500',
  },
}

export const checkLevel = (level: number) => {
  if (level <= 50) return levels.easy
  if (level <= 80) return levels.medium
  return levels.hard
}

export const adjustCurrency = (input: string, locale: string) => {
  const numericValue = input.replace(/\D/g, '')
  return new Intl.NumberFormat(locale).format(Number(numericValue))
}

export const revertAdjustedCurrency = (input: string, locale: string) => {
  const formatter = new Intl.NumberFormat(locale)
  const parts = formatter.formatToParts(1234.56)

  const groupSeparator = parts.find(p => p.type === 'group')?.value || ','
  const decimalSeparator = parts.find(p => p.type === 'decimal')?.value || '.'

  return (
    Number(input.replace(new RegExp(`\\${groupSeparator}`, 'g'), '').replace(decimalSeparator, '.')) || 0
  )
}
