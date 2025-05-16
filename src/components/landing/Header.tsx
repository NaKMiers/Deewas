'use client'

import { Link } from '@/i18n/navigation'
import { cn } from '@/lib/utils'
import { LucideMenu, LucideMoon, LucideSun } from 'lucide-react'
import { useTheme } from 'next-themes'
import Image from 'next/image'
import { useState } from 'react'
import { Button } from '../ui/button'
import { Switch } from '../ui/switch'

interface HeaderProps {
  routes: string[]
  className?: string
}

function Header({ routes, className }: HeaderProps) {
  // hooks
  const { resolvedTheme, setTheme } = useTheme()

  // states
  const [openNav, setOpenNav] = useState<boolean>(false)

  return (
    <div className={cn('sticky top-0 z-10 bg-background/50', className)}>
      <header className="container flex h-[52px] items-center justify-between px-21/2 drop-shadow-lg md:px-21">
        <div className="flex items-center gap-1">
          <Image
            src={resolvedTheme === 'dark' ? '/images/dark-logo.png' : '/images/light-logo.png'}
            width={32}
            height={32}
            alt="deewas"
          />
          <p className="text-xl font-bold">DEEWAS</p>
        </div>

        <div className="flex items-center gap-21">
          <div className="hidden items-center gap-3 md:flex">
            {routes.map(item => (
              <Link
                href={`#${item}`}
                className={cn(
                  'trans-200 flex-shrink-0 text-sm font-medium capitalize hover:text-sky-500'
                )}
                key={item}
              >
                {item}
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

          <Button
            className="h-8 w-8 md:hidden"
            onClick={() => setOpenNav(!openNav)}
          >
            <LucideMenu />
          </Button>
        </div>

        <div
          className={cn(
            'trans-300 absolute left-0 top-[52px] flex w-full flex-col overflow-hidden bg-background px-21 md:hidden',
            openNav ? 'max-h-[500px]' : 'max-h-0'
          )}
        >
          {routes.map(item => (
            <Link
              href={`#${item}`}
              className={cn(
                'trans-200 h-10 flex-shrink-0 text-sm font-medium capitalize hover:text-sky-500'
              )}
              key={item}
            >
              {item}
            </Link>
          ))}
        </div>
      </header>
    </div>
  )
}

export default Header
