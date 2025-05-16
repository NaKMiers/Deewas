import { JWT } from 'next-auth/jwt'
import createMiddleware from 'next-intl/middleware'
import { NextRequest, NextResponse } from 'next/server'
import { routing } from './i18n/routing'
import { checkPremium, extractToken } from './lib/utils'

// MARK: Internationalization Middleware
const intlMiddleware = createMiddleware(routing)

// Require UnAuth
const requireUnAuth = async (req: NextRequest, token: JWT | null, locale: string = 'en') => {
  console.log('- Require UnAuth -')
  return token ? NextResponse.redirect(new URL(`/${locale}`, req.url)) : intlMiddleware(req)
}

// Require Auth
const requireAuth = async (req: NextRequest, token: JWT | null, locale: string = 'en') => {
  console.log('- Require Auth -')
  if (!token) return NextResponse.redirect(new URL(`/${locale}/auth/sign-in`, req.url))

  const isPremium = checkPremium(token)

  if (!isPremium) return NextResponse.redirect(new URL(`/${locale}/onboarding`, req.url))

  return intlMiddleware(req)
}

// Require Auth For Api
const requireAuthForApi = async (req: NextRequest, token: JWT | null, locale: string = 'en') => {
  console.log('- Require Auth For Api -')
  return !token
    ? NextResponse.redirect(new URL(`/${locale}/auth/sign-in`, req.url))
    : NextResponse.next()
}

// Require Admin
const requireAdmin = async (req: NextRequest, token: JWT | null, locale: string = 'en') => {
  console.log('- Require Admin -')
  return !['admin'].includes(token?.role as string)
    ? NextResponse.redirect(new URL(`/${locale}`, req.url))
    : intlMiddleware(req)
}

// Require Admin For Api
const requireAdminForApi = async (req: NextRequest, token: JWT | null, locale: string = 'en') => {
  console.log('- Require Admin For Api -')
  return !['admin'].includes(token?.role as string)
    ? NextResponse.redirect(new URL(`/${locale}`, req.url))
    : NextResponse.next()
}

export default async function middleware(req: NextRequest) {
  const token = await extractToken(req)
  const pathname = req.nextUrl.pathname
  const locale = req.cookies.get('NEXT_LOCALE')?.value || 'en'

  if (['/api'].some(path => pathname.startsWith(path))) {
    if (
      ['/api/auth', '/api/report', '/api/revenuecat-event', '/api/support'].some(path =>
        pathname.startsWith(path)
      )
    ) {
      return NextResponse.next()
    } else if (['/api/admin'].some(path => pathname.startsWith(path))) {
      return requireAdminForApi(req, token, locale) // require admin
    } else {
      return requireAuthForApi(req, token, locale) // not required
    }
  } else {
    const purePathname = pathname.replace(/^\/(vi|en)/, '') || '/'
    if (['/auth'].some(path => purePathname.startsWith(path))) {
      return requireUnAuth(req, token, locale) // require unauth
    } else if (
      ['/transactions', '/budgets', '/account', '/wallets', '/categories', '/calendar', '/streaks'].some(
        path => purePathname.startsWith(path)
      ) ||
      purePathname === '/'
    ) {
      return requireAuth(req, token, locale) // require auth
    } else if (['/admin'].some(path => purePathname.startsWith(path))) {
      return requireAdmin(req, token, locale) // require admin
    } else {
      return intlMiddleware(req)
    }
  }
}

// math all routes
export const config = {
  matcher: [
    '/',
    '/(vi|en)/:path*',
    '/(transactions|budgets|account|wallets|categories|auth|calendar|streaks|admin|api)/:path*',
    '/(about|support|help|privacy-policy|terms-and-service|onboarding|landing)/:path*',
  ],
}
