'use client'

import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer'
import { useAppSelector } from '@/hooks/reduxHook'
import {
  LucideArrowLeftRight,
  LucideBookCopy,
  LucideChartPie,
  LucideHouse,
  LucidePiggyBank,
  LucidePlus,
  LucideWallet,
  LucideWalletCards,
} from 'lucide-react'
import { useSession } from 'next-auth/react'
import Image from 'next/image'
import Link from 'next/link'
import CreateCategoryDialog from './dialogs/CreateCategoryDialog'
import CreateWalletDialog from './dialogs/CreateWalletDialog'
import { Button } from './ui/button'
import CreateTransactionDialog from './dialogs/CreateTransactionDialog'
import CreateBudgetDialog from './dialogs/CreateBudgetDialog'

function Navbar() {
  // hooks
  const { data: session } = useSession()
  const user: any = session?.user

  const { curWallet } = useAppSelector(state => state.wallet)

  return (
    <>
      <nav className="fixed bottom-0 left-0 flex h-[70px] w-full items-center justify-between gap-0.5 bg-primary pb-2.5 text-secondary">
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

        <Drawer>
          <DrawerTrigger asChild>
            <button className="flex flex-1 flex-col items-center justify-center gap-0.5">
              <div className="rounded-full bg-secondary p-2 text-primary">
                <LucidePlus size={18} />
              </div>
            </button>
          </DrawerTrigger>
          <DrawerContent>
            <div className="mx-auto w-full max-w-sm">
              <DrawerHeader>
                <DrawerTitle className="flex items-center justify-center gap-2">
                  <p className="font-semibold">Welcome to Deewas</p>
                </DrawerTitle>
                <DrawerDescription>Take control of your daily finances</DrawerDescription>
              </DrawerHeader>

              <div className="my-1 flex flex-col gap-2 px-4">
                <CreateWalletDialog
                  trigger={
                    <Button variant="outline">
                      <LucideWalletCards />
                      Create Wallet
                    </Button>
                  }
                />

                <CreateCategoryDialog
                  trigger={
                    <Button variant="outline">
                      <LucideBookCopy />
                      Create Category
                    </Button>
                  }
                />

                <CreateTransactionDialog
                  trigger={
                    <Button variant="outline">
                      <LucideArrowLeftRight />
                      Create Transaction
                    </Button>
                  }
                />

                <CreateBudgetDialog
                  trigger={
                    <Button variant="outline">
                      <LucideChartPie />
                      Create Budget
                    </Button>
                  }
                />
              </div>

              <DrawerFooter>
                <DrawerClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DrawerClose>
              </DrawerFooter>
            </div>
          </DrawerContent>
        </Drawer>

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
    </>
  )
}

export default Navbar
