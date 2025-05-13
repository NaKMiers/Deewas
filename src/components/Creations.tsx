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
import { addBudget } from '@/lib/reducers/budgetReducer'
import { addCategory } from '@/lib/reducers/categoryReduce'
import { refresh } from '@/lib/reducers/loadReducer'
import { addTransaction } from '@/lib/reducers/transactionReducer'
import { addWallet } from '@/lib/reducers/walletReducer'
import { IFullBudget } from '@/models/BudgetModel'
import { ICategory } from '@/models/CategoryModel'
import { IFullTransaction } from '@/models/TransactionModel'
import { IWallet } from '@/models/WalletModel'
import {
  LucideArrowLeftRight,
  LucideBookCopy,
  LucideChartPie,
  LucidePlus,
  LucideWalletCards,
} from 'lucide-react'
import { useTranslations } from 'next-intl'
import CreateBudgetDrawer from './dialogs/CreateBudgetDrawer'
import CreateCategoryDrawer from './dialogs/CreateCategoryDrawer'
import CreateTransactionDrawer from './dialogs/CreateTransactionDrawer'
import CreateWalletDrawer from './dialogs/CreateWalletDrawer'
import { Button } from './ui/button'

function Creations() {
  // hooks
  const dispatch = useAppDispatch()
  const t = useTranslations('navbar')

  return (
    <Drawer>
      <DrawerTrigger asChild>
        <button className="fixed bottom-[calc(78px)] right-2 z-20 h-10 rounded-full xl:right-[calc(50%-640px+21px)]">
          <div className="aspect-square rounded-full bg-primary p-2 text-secondary">
            <LucidePlus size={24} />
          </div>
        </button>
      </DrawerTrigger>
      <DrawerContent>
        <div className="mx-auto w-full max-w-sm">
          <DrawerHeader>
            <DrawerTitle className="text-center">
              <p className="font-semibold">{t('Welcome to Deewas')}</p>
            </DrawerTitle>
            <DrawerDescription className="text-center">
              {t('Take control of your daily finances')}
            </DrawerDescription>
          </DrawerHeader>

          <div className="my-1 flex flex-col gap-2 px-4">
            <CreateTransactionDrawer
              update={(transaction: IFullTransaction) => {
                dispatch(addTransaction(transaction))
                dispatch(refresh())
              }}
              trigger={
                <Button variant="outline">
                  <LucideArrowLeftRight />
                  {t('Create Transaction')}
                </Button>
              }
            />

            <CreateBudgetDrawer
              update={(budget: IFullBudget) => dispatch(addBudget(budget))}
              trigger={
                <Button variant="outline">
                  <LucideChartPie />
                  {t('Create Budget')}
                </Button>
              }
            />

            <CreateWalletDrawer
              update={(wallet: IWallet) => dispatch(addWallet(wallet))}
              trigger={
                <Button variant="outline">
                  <LucideWalletCards />
                  {t('Create Wallet')}
                </Button>
              }
            />

            <CreateCategoryDrawer
              update={(category: ICategory) => dispatch(addCategory(category))}
              trigger={
                <Button variant="outline">
                  <LucideBookCopy />
                  {t('Create Category')}
                </Button>
              }
            />
          </div>

          <DrawerFooter>
            <DrawerClose asChild>
              <Button variant="outline">{t('Cancel')}</Button>
            </DrawerClose>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  )
}

export default Creations
