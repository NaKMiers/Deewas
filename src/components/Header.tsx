'use client'

import { Link, useRouter } from '@/i18n/navigation'
import { shortName } from '@/lib/string'
import { cn } from '@/lib/utils'
import { LucideCalendarDays } from 'lucide-react'
import { signOut, useSession } from 'next-auth/react'
import { useLocale, useTranslations } from 'next-intl'
import Image from 'next/image'
import { useEffect } from 'react'
import { Button } from './ui/button'

function Header() {
  // hooks
  const { data: session, update } = useSession()
  const user: any = session?.user
  const t = useTranslations('header')
  const router = useRouter()
  const locale = useLocale()

  useEffect(() => {
    setInterval(
      () => {
        update()
      },
      2 * 60 * 1000
    ) // 60s
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!user) return

    if (user.isDeleted) {
      alert('This account has been deleted ')
      signOut()
    }
  }, [user, router, locale])

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
          <Link href="/">
            <h1 className="text-nowrap font-semibold tracking-wide">
              {t('Hi')} {shortName(user)}!👋
            </h1>
          </Link>
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
