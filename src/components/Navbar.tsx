import { Link, usePathname } from '@/i18n/navigation'
import { cn } from '@/lib/utils'
import { CircleUserRound, Home, PieChart, Wallet } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { useTheme } from 'next-themes'
import Image from 'next/image'
import { memo, useMemo } from 'react'

interface NavbarProps {
  className?: string
  [key: string]: any
}

function Navbar({ className }: NavbarProps) {
  // Hooks
  const { data: session } = useSession()
  const user: any = session?.user
  const { resolvedTheme } = useTheme()
  const isDarkColorScheme = resolvedTheme === 'dark'
  const pathname = usePathname()

  const routes = useMemo(
    () => [
      {
        label: 'Home',
        href: '/',
        icon: Home,
        activeColor: '#10b981',
      },
      {
        label: 'Transactions',
        href: '/transactions',
        icon: Wallet,
        activeColor: '#0ea5e9',
      },
      {
        label: 'AI',
        href: '/ai',
        activeColor: '#f43f5e',
        source: isDarkColorScheme ? '/images/rounded-logo-dark.png' : '/images/rounded-logo-light.png',
        width: 32,
        height: 32,
        className: 'rounded-none',
      },
      {
        label: 'Budgets',
        href: '/budgets',
        icon: PieChart,
        activeColor: '#8b5cf6',
      },
      {
        label: 'Account',
        href: '/account',
        source: user?.avatar || undefined,
        icon: user?.authType === 'google' ? undefined : CircleUserRound,
        size: 25,
        activeColor: '#f59e0b',
      },
    ],
    [user, isDarkColorScheme]
  )

  return (
    <nav
      className={cn(
        'fixed bottom-21 left-1/2 flex w-full max-w-[400px] -translate-x-1/2 justify-center rounded-full bg-primary shadow-md',
        className
      )}
    >
      {routes.map(route => (
        <Link
          href={route.href}
          key={route.href}
          className={cn(
            'flex flex-1 flex-row items-center justify-center gap-0.5 rounded-full py-1 text-secondary transition-colors duration-200',
            pathname === route.href ? 'bg-gray-200' : ''
          )}
        >
          {route.icon ? (
            <route.icon
              size={route.size || 24}
              color={pathname === route.href ? route.activeColor : undefined}
            />
          ) : (
            <div
              className={cn('overflow-hidden rounded-full', route.className)}
              style={{ height: route.height || 26, width: route.width || 26 }}
            >
              <Image
                src={route.source || '/default-avatar.png'}
                alt={route.label}
                width={route.width || 26}
                height={route.height || 26}
                className="h-full w-full object-cover"
              />
            </div>
          )}
        </Link>
      ))}
    </nav>
  )
}

export default memo(Navbar)
