'use client'

import { Link, usePathname } from '@/i18n/navigation'
import { cn } from '@/lib/utils'
import { LucideFileBarChart, LucideLayoutDashboard, LucideSidebar } from 'lucide-react'
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
        'trans-200 h-[calc(100vh-50px)] w-full bg-primary p-21/2 text-secondary',
        open ? 'max-w-[200px]' : 'max-w-[60px]',
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

      <div className="mt-6 flex flex-col gap-21/2">
        {menu.map(item => (
          <Link
            href={item.href}
            className={cn(
              'trans-200 flex h-8 items-center gap-3 overflow-hidden rounded-lg px-21/2 font-semibold hover:bg-secondary/30 hover:underline',
              pathname === item.href && 'bg-secondary text-primary hover:bg-secondary'
            )}
            title={item.title}
            key={item.href}
          >
            <item.icon
              size={18}
              className="flex-shrink-0"
            />
            <span>{item.title}</span>
          </Link>
        ))}
      </div>
    </div>
  )
}

export default Sidebar
