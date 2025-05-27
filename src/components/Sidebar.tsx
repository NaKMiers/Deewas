'use client'

import { Link, usePathname } from '@/i18n/navigation'
import { cn } from '@/lib/utils'
import {
  LucideFileBarChart,
  LucideLayoutDashboard,
  LucidePlus,
  LucideSidebar,
  LucideTickets,
  LucideUsers,
} from 'lucide-react'
import { useState } from 'react'

interface SidebarProps {
  className?: string
}

const menu = [
  {
    title: 'Dashboard',
    icon: LucideLayoutDashboard,
    href: '/admin',
  },
  {
    title: 'Users',
    icon: LucideUsers,
    href: '/admin/users',
  },
  {
    title: 'Referral Codes',
    icon: LucideTickets,
    href: '/admin/referral-codes',
    addHref: '/admin/referral-codes/add',
  },
  {
    title: 'Reports',
    icon: LucideFileBarChart,
    href: '/admin/reports',
  },
]

function Sidebar({ className }: SidebarProps) {
  // states
  const [open, setOpen] = useState<boolean>(true)
  const pathname = usePathname()

  return (
    <div
      className={cn(
        'trans-200 h-screen w-full bg-primary p-21/2 text-secondary',
        open ? 'max-w-[222px]' : 'max-w-[60px]',
        className
      )}
    >
      <div className="flex items-center justify-between gap-2">
        {open && (
          <h1 className="flex-1 text-xl font-bold capitalize">
            {pathname.split('/')[2] || 'dashboard'}
          </h1>
        )}

        <button
          className={cn('trans-200 flex flex-1 items-center justify-center', open && 'justify-end')}
          onClick={() => setOpen(!open)}
        >
          <LucideSidebar size={24} />
        </button>
      </div>

      <div className="mt-6 flex flex-col gap-21/2 overflow-hidden">
        {menu.map(item => (
          <div
            className="flex min-w-10 gap-1"
            key={item.href}
          >
            <Link
              href={item.href}
              className={cn(
                'trans-200 flex h-8 min-w-9 flex-1 items-center gap-3 overflow-hidden rounded-lg px-21/2 font-semibold hover:bg-secondary/30 hover:underline',
                pathname === item.href && 'bg-secondary text-primary hover:bg-secondary'
              )}
              title={item.title}
            >
              <item.icon
                size={18}
                className="flex-shrink-0"
              />
              <span className="line-clamp-1 block overflow-hidden text-ellipsis text-nowrap text-sm">
                {item.title}
              </span>
            </Link>
            {item.addHref && (
              <Link
                href={item.addHref}
                className={cn(
                  'flex h-8 items-center rounded-lg px-21/2 font-semibold hover:bg-secondary/30 hover:underline',
                  pathname === item.href && 'bg-secondary text-primary hover:bg-secondary'
                )}
                title={item.title}
              >
                <LucidePlus
                  size={16}
                  className="flex-shrink-0"
                />
              </Link>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default Sidebar
