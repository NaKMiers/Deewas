'use client'

import CreateTransactionDrawer from '@/components/dialogs/CreateTransactionDrawer'
import History from '@/components/History'
import NoItemsFound from '@/components/NoItemsFound'
import Transaction from '@/components/Transaction'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { useAppSelector } from '@/hooks/reduxHook'
import { checkTranType, formatCurrency } from '@/lib/string'
import { cn } from '@/lib/utils'
import { IFullTransaction } from '@/models/TransactionModel'
import { LucidePlusSquare } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useParams } from 'next/navigation'
import { useCallback, useState } from 'react'

function CategoryHistoryPage() {
  // hooks
  const params = useParams()
  const t = useTranslations('categoryHistoryPage')

  // store
  const categories = useAppSelector(state => state.category.categories)
  const category = categories.find(c => c._id === params.id)
  const currency = useAppSelector(state => state.settings.settings?.currency)
  const isIncludeTransfer = false

  // states
  const [loading, setLoading] = useState<boolean>(true)
  const [transactions, setTransactions] = useState<IFullTransaction[]>([])

  // calculate total
  const calcTotal = useCallback(() => {
    return transactions
      .filter(t => !t.exclude || isIncludeTransfer)
      .reduce((total, tx) => total + tx.amount, 0)
  }, [isIncludeTransfer, transactions])

  if (!category) return null

  return (
    <div className="container min-h-[calc(100vh-50px)] p-21/2 md:p-21">
      {/* Header */}
      <div className="flex flex-row items-center justify-between gap-2 py-0.5">
        <div className="flex flex-1 flex-row items-center gap-2">
          <p className="flex-shrink-0 text-3xl">{category.icon}</p>
          <div className="flex flex-1 flex-col">
            <p className="flex-1 text-xl font-semibold">{category.name}</p>
            {currency && (
              <p
                className={cn(
                  'ml-0.5 mt-0.5 text-lg tracking-tight',
                  checkTranType(category.type).color
                )}
              >
                {formatCurrency(currency, category.amount)}
              </p>
            )}
          </div>
        </div>

        {/* MARK: New Transaction for category */}
        <CreateTransactionDrawer
          initCategory={category}
          trigger={
            <Button
              variant="outline"
              className="flex h-7 items-center gap-1.5 rounded-md border border-primary/10 bg-secondary px-2 text-xs"
            >
              <LucidePlusSquare />
              {t('Add Transaction')}
            </Button>
          }
        />
      </div>

      <Separator className="my-4 h-0" />

      <History
        category={category}
        onFetchedData={(data: IFullTransaction[]) => {
          setTransactions(data)
          setLoading(false)
        }}
      />

      <Separator className="my-2 h-0" />

      {/* Transactions */}
      <div className="shadow-md">
        {!loading ? (
          <div className="w-full overflow-hidden rounded-xl border border-primary/10 p-21/2">
            {transactions.length > 0 ? (
              transactions.map(tx => (
                <div
                  className="mb-1"
                  key={tx._id}
                >
                  <Transaction
                    transaction={tx}
                    disableClick
                    key={tx._id}
                  />
                </div>
              ))
            ) : (
              <NoItemsFound text={t('No transactions found')} />
            )}

            {currency && transactions.length > 0 && <div className="my-3 h-px bg-primary" />}

            {currency && transactions.length > 0 && (
              <div className="flex flex-row items-center justify-between pr-8">
                <p className="text-xl font-bold">{t('Total')}</p>

                <p
                  className={cn(
                    'h-full rounded-full text-xl font-bold',
                    calcTotal() < 0 ? 'text-rose-500' : 'text-emerald-500'
                  )}
                >
                  {formatCurrency(currency, calcTotal())}
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="mt-21/2 gap-21/2 md:gap-21 md:px-21">
            <Skeleton className="h-[250px] p-4" />
          </div>
        )}
      </div>

      <Separator className="my-20 h-0" />
    </div>
  )
}

export default CategoryHistoryPage
