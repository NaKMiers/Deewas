'use client'

import { LucideChartPie, LucideHouse, LucidePlus, LucideWallet } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { useTheme } from 'next-themes'
import Image from 'next/image'
import Link from 'next/link'

function Navbar() {
  // hooks
  const { data: session } = useSession()
  const user: any = session?.user
  const { theme, setTheme } = useTheme()

  return (
    <nav className="fixed bottom-0 left-0 flex h-[60px] w-full justify-between gap-0.5 bg-primary text-secondary">
      <Link
        href="/"
        className="flex flex-1 flex-col items-center justify-center gap-0.5"
      >
        <LucideHouse size={18} />
        <span className="text-xs font-semibold">Home</span>
      </Link>
      <Link
        href="/transactions"
        className="flex flex-1 flex-col items-center justify-center gap-0.5"
      >
        <LucideWallet size={18} />
        <span className="text-xs font-semibold">Transactions</span>
      </Link>

      <button
        className="flex flex-1 flex-col items-center justify-center gap-0.5"
        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      >
        <div className="rounded-full bg-secondary p-2 text-primary">
          <LucidePlus size={18} />
        </div>
      </button>

      <Link
        href="/budgets"
        className="flex flex-1 flex-col items-center justify-center gap-0.5"
      >
        <LucideChartPie size={18} />
        <span className="text-xs font-semibold">Budget</span>
      </Link>
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
        <span className="text-xs font-semibold">Account</span>
      </Link>
    </nav>
  )
}

export default Navbar
