'use client'

import CreateTransactionDrawer from '@/components/dialogs/CreateTransactionDrawer'
import TransactionTypeGroup from '@/components/TransactionTypeGroup'
import { Button } from '@/components/ui/button'
import { DateRangePicker } from '@/components/ui/DateRangePicker'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import WalletSelection from '@/components/WalletSelection'
import { useAppDispatch, useAppSelector } from '@/hooks/reduxHook'
import { setCurWallet } from '@/lib/reducers/walletReducer'
import { toUTC } from '@/lib/time'
import { IFullTransaction } from '@/models/TransactionModel'
import { IWallet } from '@/models/WalletModel'
import { getMyTransactionsApi } from '@/requests/transactionRequests'
import { differenceInDays } from 'date-fns'
import { LucidePlus, LucideSearch } from 'lucide-react'
import moment from 'moment-timezone'
import { useCallback, useEffect, useState } from 'react'
import toast from 'react-hot-toast'

function TransactionsPage() {
  // hooks
  const dispatch = useAppDispatch()

  // store
  const { curWallet } = useAppSelector(state => state.wallet)

  // states
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: moment().startOf('month').toDate(), // default is current month
    to: moment().toDate(),
  })
  const [wallet, setWallet] = useState<IWallet | null>(curWallet)
  const [groups, setGroups] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  // initially set wallet
  useEffect(() => {
    curWallet && setWallet(curWallet)
  }, [curWallet])

  // group transactions
  const handleGroupTransactions = useCallback((transactions: IFullTransaction[]) => {
    const groups: any = {}

    transactions.forEach((transaction: IFullTransaction) => {
      const type = transaction.type

      if (!groups[type]) {
        groups[type] = []
      }

      groups[type].push(transaction)
    })

    for (const type in groups) {
      const categoryGroups: any = {}

      groups[type].forEach((transaction: IFullTransaction) => {
        const category = transaction.category._id

        if (!categoryGroups[category]) {
          categoryGroups[category] = {
            category: transaction.category,
            transactions: [],
          }
        }

        categoryGroups[category].transactions.push(transaction)
      })

      groups[type] = categoryGroups
    }

    setGroups(Object.entries(groups))
  }, [])

  // get my transactions of selected wallet
  const getMyTransactions = useCallback(async () => {
    if (!wallet) return

    const query = `?walletId=${wallet._id}&from=${toUTC(dateRange.from)}&to=${toUTC(dateRange.to)}`
    console.log('query', query)

    // start loading
    setLoading(true)

    try {
      const { transactions } = await getMyTransactionsApi(query)
      handleGroupTransactions(transactions)
    } catch (err: any) {
      console.log(err)
      toast.error('Failed to fetch transactions')
    } finally {
      // stop loading
      setLoading(false)
    }
  }, [handleGroupTransactions, dateRange, wallet])

  // initial fetch
  useEffect(() => {
    getMyTransactions()
  }, [getMyTransactions])

  return (
    <div className="container pb-32">
      {/* Top */}
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 px-21/2 py-4 md:px-21">
        <h2 className="text-lg font-bold">
          Transactions <span className="text-muted-foreground/50">of wallet</span>
        </h2>

        <WalletSelection
          update={(wallet: IWallet) => {
            setWallet(wallet)
            dispatch(setCurWallet(wallet))
          }}
        />
      </div>

      {/* Date Range */}
      <div className="mb-21/2 flex items-center justify-end px-21/2 md:px-21">
        <DateRangePicker
          initialDateFrom={dateRange.from}
          initialDateTo={dateRange.to}
          showCompare={false}
          onUpdate={values => {
            const { from, to } = values.range

            if (!from || !to) return
            if (differenceInDays(to, from) > +90) {
              toast.error(`The selected date range is too large. Max allowed range is ${90} days!`)
              return
            }

            setDateRange({ from, to })
          }}
        />
      </div>

      {/* Search & Date Range */}
      <div className="mb-21/2 flex items-center justify-end gap-2 px-21/2 md:px-21">
        {/* Search */}
        <div className="flex w-full overflow-hidden rounded-md shadow-sm">
          <Button
            variant="outline"
            size="icon"
            className="w-10 flex-shrink-0 rounded-r-none"
          >
            <LucideSearch />
          </Button>

          <Input
            className="rounded-l-none border border-l-0 text-sm !ring-0"
            placeholder="Search..."
          />
        </div>
      </div>

      {/* Groups */}
      {!loading ? (
        <div className="flex flex-col gap-2 px-21/2 md:px-21">
          {groups.length > 0 ? (
            groups.map(([type, group]) => (
              <TransactionTypeGroup
                type={type}
                categoryGroups={Object.entries(group).map(g => g[1])}
                key={type}
                refetch={getMyTransactions}
              />
            ))
          ) : (
            <div className="flex items-center justify-center rounded-md border border-muted-foreground/50 px-2 py-7">
              <p className="text-center text-lg font-semibold text-muted-foreground/50">
                No transactions found for this wallet. Just add one now!
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-2 px-21/2 md:px-21">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton
              className="h-[300px]"
              key={i}
            />
          ))}
        </div>
      )}

      {/* Create Transaction */}
      <CreateTransactionDrawer
        refetch={getMyTransactions}
        trigger={
          <Button
            variant="default"
            className="fixed bottom-[calc(78px)] right-2 z-20 h-10 rounded-full"
          >
            <LucidePlus size={24} />
            Add Transaction
          </Button>
        }
      />
    </div>
  )
}

export default TransactionsPage
