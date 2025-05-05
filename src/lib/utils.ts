import { clsx, type ClassValue } from 'clsx'
import { jwtVerify } from 'jose'
import moment from 'moment-timezone'
import { getToken } from 'next-auth/jwt'
import { NextRequest } from 'next/server'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const extractToken = async (req: NextRequest) => {
  const authToken = req.headers.get('Authorization')?.split(' ')[1]
  if (authToken) {
    // Verify the token
    const { payload } = await jwtVerify(authToken, new TextEncoder().encode(process.env.NEXTAUTH_SECRET))
    return payload
  }

  return await getToken({ req })
}

export const checkPremium = (user: any) => {
  if (!user || !user.plan) return false

  switch (user.plan) {
    case 'premium-lifetime':
      return true
    case 'premium-monthly':
    case 'premium-yearly':
      return moment(user.planExpiredAt).isAfter(moment()) // not expire yet
    default:
      return false
  }
}
