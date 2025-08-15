'use client'

import { languages, LanguageType } from '@/constants/settings'
import { Link, usePathname, useRouter } from '@/i18n/navigation'
import { checkPremium, cn } from '@/lib/utils'
import { LucideChevronsUpDown, LucideMenu, LucideMoon, LucideSun } from 'lucide-react'
import { signOut, useSession } from 'next-auth/react'
import { useLocale, useTranslations } from 'next-intl'
import { useTheme } from 'next-themes'
import Image from 'next/image'
import { ReactNode, useCallback, useState } from 'react'
import { Button } from '../ui/button'
import { Command, CommandItem, CommandList, CommandSeparator } from '../ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover'
import { Separator } from '../ui/separator'
import { Switch } from '../ui/switch'

interface HeaderProps {
  routes: string[]
  className?: string
}

function Header({ routes, className }: HeaderProps) {
  // hooks
  const { data: session } = useSession()
  const user = session?.user
  const { resolvedTheme, setTheme } = useTheme()
  const [openNav, setOpenNav] = useState<boolean>(false)
  const router = useRouter()
  const t = useTranslations('landingPage')

  return (
    <div className={cn('sticky top-0 z-10 bg-background/50', className)}>
      {!checkPremium(user) && (
        <p className="border-b border-primary/10 px-2 py-1 text-center text-xs md:text-sm">
          {(() => {
            const premiumText = t('Premium')
            const message = t('Download the app and upgrade to Premium to access web version')
            const parts = message.split(premiumText)
            return parts.reduce<ReactNode[]>((acc, part, idx) => {
              acc.push(part)
              if (idx < parts.length - 1) {
                acc.push(
                  <span
                    className="font-semibold text-green-500"
                    key={idx}
                  >
                    {premiumText}
                  </span>
                )
              }
              console.log(acc)
              return acc
            }, [])
          })()}
        </p>
      )}
      <header className="relative mx-auto flex h-[52px] w-full items-center justify-between gap-21 px-21/2 drop-shadow-lg md:max-w-fit lg:px-21">
        <Link
          href="/"
          className="flex items-center gap-1"
          onClick={() => setOpenNav(false)}
        >
          <Image
            src={resolvedTheme === 'dark' ? '/images/dark-logo.png' : '/images/light-logo.png'}
            width={32}
            height={32}
            alt="deewas"
          />
          <p className="text-xl font-bold">DEEWAS</p>
        </Link>

        <div className="flex items-center gap-21/2 md:gap-21">
          <div className="hidden items-center gap-3 lg:flex">
            {routes.map(item => (
              <Link
                href={`#${item}`}
                className={cn(
                  'trans-200 flex-shrink-0 text-sm font-medium capitalize hover:text-sky-500'
                )}
                key={item}
              >
                {t(item)}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-2">
            {resolvedTheme === 'dark' ? <LucideMoon size={18} /> : <LucideSun size={18} />}
            <Switch
              checked={resolvedTheme === 'dark'}
              onCheckedChange={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
              className="bg-gray-300 data-[state=checked]:bg-sky-500"
            />
          </div>

          <LanguageSelection triggerClassName="hidden lg:flex" />

          <Button onClick={() => (user ? signOut() : router.push('/auth/sign-in'))}>
            {user ? t('Sign Out') : t('Sign In')}
          </Button>

          <Button
            className="h-8 w-8 lg:hidden"
            onClick={() => setOpenNav(!openNav)}
          >
            <LucideMenu />
          </Button>
        </div>

        <div
          className={cn(
            'trans-300 absolute left-0 top-[52px] flex w-full flex-col overflow-hidden rounded-b-3xl bg-background/80 px-21 lg:hidden',
            openNav ? 'max-h-[500px]' : 'max-h-0'
          )}
        >
          {routes.map(item => (
            <Link
              href={`#${item}`}
              className={cn(
                'trans-200 h-10 flex-shrink-0 text-sm font-medium capitalize hover:text-sky-500'
              )}
              onClick={() => setOpenNav(false)}
              key={item}
            >
              {t(item)}
            </Link>
          ))}
          <LanguageSelection triggerClassName="max-w-max" />
          <Separator className="my-21/2 h-0" />
        </div>
      </header>
    </div>
  )
}

export default Header

function LanguageSelection({
  triggerClassName,
  className,
}: {
  triggerClassName?: string
  className?: string
}) {
  // hooks
  const tBox = useTranslations('settingsBox')
  const router = useRouter()
  const pathname = usePathname()
  const locale = useLocale()

  // states
  const [openLanguage, setOpenLanguage] = useState<boolean>(false)
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageType>(
    languages.find(lang => lang.value === locale) || languages[0]
  )

  // handle change language
  const handleChangeLanguage = useCallback(
    (nextLocale: string) => {
      router.push(pathname, { locale: nextLocale })
    },
    [router, pathname]
  )

  return (
    <Popover
      open={openLanguage}
      onOpenChange={setOpenLanguage}
    >
      <PopoverTrigger
        asChild
        className={cn(triggerClassName)}
      >
        <Button
          variant="outline"
          className="justify-between border border-primary/10 bg-primary-foreground"
        >
          <p className="text-xs uppercase">
            {selectedLanguage ? selectedLanguage.value : `${tBox('language')}`}
          </p>
          <LucideChevronsUpDown size={18} />
        </Button>
      </PopoverTrigger>
      <PopoverContent className={cn('w-full p-0 shadow-md', className)}>
        <Command className="rounded-lg border shadow-md">
          <CommandList>
            <CommandSeparator />
            {languages.map((item, index) => (
              <CommandItem
                onSelect={() => {
                  handleChangeLanguage(item.value)
                  setSelectedLanguage(item)
                  setOpenLanguage(false)
                }}
                className="cursor-pointer font-semibold"
                key={index}
              >
                {item.label}
              </CommandItem>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
