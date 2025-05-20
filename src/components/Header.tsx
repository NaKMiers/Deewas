'use client'

import { useRouter } from '@/i18n/navigation'
import { shortName } from '@/lib/string'
import { checkPremium, cn } from '@/lib/utils'
import { LucideCalendarDays } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { useLocale, useTranslations } from 'next-intl'
import Image from 'next/image'
import { useEffect } from 'react'
import { Button } from './ui/button'

function Header() {
  // hooks
  const { data: session } = useSession()
  const user: any = session?.user
  const isPremium = checkPremium(user)
  const t = useTranslations('header')
  const router = useRouter()
  const locale = useLocale()

  useEffect(() => {
    if (!isPremium) {
      router.replace('/onboarding')
    }
  }, [isPremium, router])

  return (
    <header className={cn('h-[50px] w-full border-b border-muted-foreground bg-primary text-secondary')}>
      <div className="container flex h-full items-center justify-between px-21/2 md:px-21">
        <div className="flex items-center gap-2 md:gap-4">
          <Button
            variant="secondary"
            size="icon"
            className="h-8 w-8"
            onClick={() => router.push('/calendar', { locale })}
          >
            <LucideCalendarDays size={22} />
          </Button>
          <h1 className="text-nowrap font-semibold tracking-wide">
            {t('Hi')} {shortName(user)}!👋
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="icon"
            onClick={() => router.push('/streaks')}
          >
            <Image
              src="/icons/flame.gif"
              width={30}
              height={30}
              alt="streaks"
              className="h-full w-full object-cover"
            />
          </Button>
        </div>
      </div>
    </header>
  )
}

export default Header
