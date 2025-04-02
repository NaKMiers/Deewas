import { clsx, type ClassValue } from 'clsx'
import { jwtVerify } from 'jose'
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
