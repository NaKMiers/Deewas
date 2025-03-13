'use client'

import { useAppDispatch } from '@/hooks/reduxHook'
import { Link, usePathname } from '@/i18n/navigation'
import { setCurWallet } from '@/lib/reducers/walletReducer'
import { cn } from '@/lib/utils'
import { LucideChartPie, LucideHouse, LucideWallet } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import Image from 'next/image'
import { memo } from 'react'

function Navbar() {
  // hooks
  const { data: session } = useSession()
  const user: any = session?.user
  const t = useTranslations('navbar')
  const pathname = usePathname()
  const dispatch = useAppDispatch()

  return (
    <nav className="fixed bottom-21 left-1/2 z-50 w-full max-w-[400px] -translate-x-1/2 px-21/2 text-secondary">
      <div className="container flex h-full items-center justify-between gap-0.5 rounded-full bg-primary px-21/2 py-2 text-center">
        {/* Home */}
        <Link
          href="/"
          className={cn(
            'trans-200 flex flex-1 flex-col items-center justify-center gap-0.5 rounded-full border border-transparent py-1',
            pathname === '/' && 'border-emerald-500 text-emerald-500 shadow-md'
          )}
        >
          <LucideHouse className="h-[22px] w-[22px] md:h-[18px] md:w-[18px]" />
          <span className="hidden text-xs font-semibold md:block">{t('Home')}</span>
        </Link>

        {/* Transactions */}
        <Link
          href="/transactions"
          className={cn(
            'trans-200 flex flex-1 flex-col items-center justify-center gap-0.5 rounded-full border border-transparent py-1',
            pathname.startsWith('/transactions') && 'border-sky-500 text-sky-500 shadow-md'
          )}
          onClick={() => dispatch(setCurWallet(null))}
        >
          <LucideWallet className="h-[22px] w-[22px] md:h-[18px] md:w-[18px]" />
          <span className="hidden text-xs font-semibold md:block">{t('Transactions')}</span>
        </Link>

        <Link
          href="/ai"
          className="flex flex-1 flex-shrink-0 flex-col items-center justify-center gap-0.5"
        >
          <div
            className={cn(
              'flex aspect-square h-9 w-9 flex-shrink-0 items-center justify-center text-nowrap rounded-full bg-secondary text-sm font-semibold text-primary md:h-10 md:w-10',
              pathname.startsWith('/ai') && 'bg-rose-500 text-white shadow-md'
            )}
          >
            AI
          </div>
        </Link>

        {/* Budget */}
        <Link
          href="/budgets"
          className={cn(
            'trans-200 flex flex-1 flex-col items-center justify-center gap-0.5 rounded-full border border-transparent py-1',
            pathname.startsWith('/budgets') && 'border-violet-500 text-violet-500 shadow-md'
          )}
        >
          <LucideChartPie className="h-[22px] w-[22px] md:h-[18px] md:w-[18px]" />
          <span className="hidden text-xs font-semibold md:block">{t('Budgets')}</span>
        </Link>

        {/* Account */}
        <Link
          href="/account"
          className={cn(
            'trans-200 flex flex-1 flex-col items-center justify-center gap-0.5 rounded-full border border-transparent py-1',
            pathname.startsWith('/account') && 'border-yellow-500 text-yellow-500 shadow-md'
          )}
        >
          <div className="aspect-square max-w-[22px] overflow-hidden rounded-full md:max-w-[20px]">
            <Image
              className="h-full w-full object-cover"
              src={user?.avatar || process.env.NEXT_PUBLIC_DEFAULT_AVATAR}
              width={30}
              height={30}
              alt="account"
            />
          </div>
          <span className="hidden text-xs font-semibold md:block">{t('Account')}</span>
        </Link>
      </div>
    </nav>
  )
}

export default memo(Navbar)
