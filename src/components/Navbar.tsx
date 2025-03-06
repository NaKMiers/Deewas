'use client'

import { Link } from '@/i18n/navigation'
import { LucideBot, LucideChartPie, LucideHouse, LucideWallet } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import Image from 'next/image'
import { memo } from 'react'

function Navbar() {
  // hooks
  const { data: session } = useSession()
  const user: any = session?.user
  const t = useTranslations('navbar')

  return (
    <nav className="fixed bottom-0 left-0 z-50 h-[70px] w-full bg-primary pb-2.5 text-secondary">
      <div className="container flex h-full items-center justify-between gap-0.5 text-center">
        {/* Home */}
        <Link
          href="/"
          className="flex flex-1 flex-col items-center justify-center gap-0.5"
        >
          <LucideHouse size={18} />
          <span className="text-xs font-semibold">{t('Home')}</span>
        </Link>

        {/* Transactions */}
        <Link
          href="/transactions"
          className="flex flex-1 flex-col items-center justify-center gap-0.5"
        >
          <LucideWallet size={18} />
          <span className="text-xs font-semibold">{t('Transactions')}</span>
        </Link>

        <Link
          href="/ai"
          className="flex flex-1 flex-col items-center justify-center gap-0.5"
        >
          <div className="aspect-square rounded-full bg-secondary p-2 text-sm font-semibold text-primary">
            <LucideBot size={18} />
          </div>
        </Link>

        {/* Budget */}
        <Link
          href="/budgets"
          className="flex flex-1 flex-col items-center justify-center gap-0.5"
        >
          <LucideChartPie size={18} />
          <span className="text-xs font-semibold">{t('Budgets')}</span>
        </Link>

        {/* Account */}
        <Link
          href="/account"
          className="flex flex-1 flex-col items-center justify-center gap-0.5"
        >
          <div className="aspect-square max-w-[20px] overflow-hidden rounded-full">
            <Image
              className="h-full w-full object-cover"
              src={user?.avatar || process.env.NEXT_PUBLIC_DEFAULT_AVATAR}
              width={30}
              height={30}
              alt="account"
            />
          </div>
          <span className="text-xs font-semibold">{t('Account')}</span>
        </Link>
      </div>
    </nav>
  )
}

export default memo(Navbar)
