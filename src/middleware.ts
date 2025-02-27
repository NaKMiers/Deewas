import { JWT, getToken } from 'next-auth/jwt'
import { NextRequest, NextResponse } from 'next/server'

// Require UnAuth
const requireUnAuth = async (req: NextRequest, token: JWT | null) => {
  console.log('- Require UnAuth -')

  // check auth
  if (token) {
    return NextResponse.redirect(new URL('/', req.url))
  }

  return NextResponse.next()
}

// Require Auth
const requireAuth = async (req: NextRequest, token: JWT | null) => {
  console.log('- Require Auth -')

  // check auth
  if (!token) {
    return NextResponse.redirect(new URL('/auth/login', req.url))
  }

  return NextResponse.next()
}

// Require Admin
const requireAdmin = async (req: NextRequest, token: JWT | null) => {
  console.log('- Require Admin -')

  // check auth
  if (!['admin'].includes(token?.role as string)) {
    return NextResponse.redirect(new URL('/', req.url))
  }

  return NextResponse.next()
}

// Middleware
export default async function middleware(req: NextRequest) {
  console.log('- Middleware -')

  const token = await getToken({ req })
  const pathname = req.nextUrl.pathname

  // exclude paths
  const excludePaths = ['/api/settings']
  const isExclude = excludePaths.includes(pathname)
  if (isExclude) {
    return NextResponse.next()
  }

  // require unAuth
  const unAuthPaths = ['/auth']
  const isRequireUnAuth = unAuthPaths.some(path => pathname.startsWith(path))
  if (isRequireUnAuth) {
    return requireUnAuth(req, token)
  }

  // require admin
  const adminPaths = ['/admin', '/api/admin', '/email']
  const isRequireAdmin = adminPaths.some(path => pathname.startsWith(path))
  if (isRequireAdmin) {
    return requireAdmin(req, token)
  }

  // require auth
  const authPaths = ['/', '/transactions', '/budgets', '/account', '/api']
  const isRequiredAuth = authPaths.some(path => pathname === path)
  if (isRequiredAuth) {
    return requireAuth(req, token)
  }
}

export const config = {
  matcher: [
    '/',
    '/api/:path*',
    '/transactions',
    '/budgets',
    '/account',
    '/admin/:path*',
    '/auth/:path*',
  ],
}
