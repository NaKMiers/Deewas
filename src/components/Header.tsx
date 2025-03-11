'use client'

import { useRouter } from '@/i18n/navigation'
import { shortName } from '@/lib/string'
import { cn } from '@/lib/utils'
import { LucideBell, LucideCalendarDays } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { useLocale, useTranslations } from 'next-intl'
import { Button } from './ui/button'
import { DropdownMenu, DropdownMenuTrigger } from './ui/dropdown-menu'

function Header({ className = '' }: { className?: string }) {
  // hooks
  const { data: session } = useSession()
  const user: any = session?.user
  const t = useTranslations('header')
  const router = useRouter()
  const locale = useLocale()

  return (
    <header
      className={cn(
        'h-[50px] w-full border-b border-muted-foreground bg-secondary text-primary',
        className
      )}
    >
      <div className="container flex h-full items-center justify-between px-21/2 md:px-21">
        <div className="flex items-center gap-2 md:gap-4">
          <Button
            size="icon"
            className="h-8 w-8"
            onClick={() => router.push('/calendar', { locale })}
          >
            <LucideCalendarDays size={22} />
          </Button>
          <h1 className="text-nowrap font-semibold tracking-wide">
            {t('Hello')} {shortName(user)}!👋
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <Button className="relative h-8">{t('Upgrade')}</Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                size="icon"
                className="h-8"
              >
                <LucideBell size={18} />
              </Button>
            </DropdownMenuTrigger>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}

export default Header
