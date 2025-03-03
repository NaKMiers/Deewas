'use client'

import { shortName } from '@/lib/string'
import { LucideBell } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { Button } from './ui/button'
import { DropdownMenu, DropdownMenuTrigger } from './ui/dropdown-menu'
import { useRouter } from 'next/navigation'

function Header() {
  // hooks
  const { data: session } = useSession()
  const user: any = session?.user
  const router = useRouter()
  console.log('router', router)

  return (
    <header className="h-[50px] w-full border-b border-muted-foreground bg-secondary text-primary">
      <div className="container flex h-full items-center justify-between px-21/2 md:px-21">
        <h1 className="text-nowrap font-semibold tracking-wide">Hello {shortName(user)}!👋</h1>

        <div className="flex items-center gap-2">
          <Button className="relative h-8">Upgrade</Button>

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
