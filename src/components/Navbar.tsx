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
import { useAppDispatch } from '@/hooks/reduxHook'
import { addWallet } from '@/lib/reducers/walletReducer'
import { IWallet } from '@/models/WalletModel'
import {
  LucideArrowLeftRight,
  LucideBookCopy,
  LucideChartPie,
  LucideHouse,
  LucidePlus,
  LucideWallet,
  LucideWalletCards,
} from 'lucide-react'
import { useSession } from 'next-auth/react'
import Image from 'next/image'
import Link from 'next/link'
import CreateBudgetDrawer from './dialogs/CreateBudgetDrawer'
import CreateCategoryDrawer from './dialogs/CreateCategoryDrawer'
import CreateTransactionDrawer from './dialogs/CreateTransactionDrawer'
import CreateWalletDrawer from './dialogs/CreateWalletDrawer'
import { Button } from './ui/button'

function Navbar() {
  // hooks
  const { data: session } = useSession()
  const user: any = session?.user
  const dispatch = useAppDispatch()

  return (
    <nav className="fixed bottom-0 left-0 h-[70px] w-full bg-primary pb-2.5 text-secondary">
      <div className="container flex h-full items-center justify-between gap-0.5">
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
                <DrawerTitle className="text-center">
                  <p className="font-semibold">Welcome to Deewas</p>
                </DrawerTitle>
                <DrawerDescription className="text-center">
                  Take control of your daily finances
                </DrawerDescription>
              </DrawerHeader>

              <div className="my-1 flex flex-col gap-2 px-4">
                <CreateWalletDrawer
                  update={(wallet: IWallet) => dispatch(addWallet(wallet))}
                  trigger={
                    <Button variant="outline">
                      <LucideWalletCards />
                      Create Wallet
                    </Button>
                  }
                />

                <CreateCategoryDrawer
                  trigger={
                    <Button variant="outline">
                      <LucideBookCopy />
                      Create Category
                    </Button>
                  }
                />

                <CreateTransactionDrawer
                  trigger={
                    <Button variant="outline">
                      <LucideArrowLeftRight />
                      Create Transaction
                    </Button>
                  }
                />

                <CreateBudgetDrawer
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
      </div>
    </nav>
  )
}

export default Navbar
