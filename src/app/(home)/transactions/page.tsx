'use client'

import CreateTransactionDialog from '@/components/dialogs/CreateTransactionDialog'
import TransactionTypeGroup from '@/components/TransactionTypeGroup'
import { Button } from '@/components/ui/button'
import { DateRangePicker } from '@/components/ui/DateRangePicker'
import { Input } from '@/components/ui/input'
import { toUTC } from '@/lib/time'
import { IFullTransaction } from '@/models/TransactionModel'
import { getMyTransactionsApi } from '@/requests/transactionRequests'
import { differenceInDays } from 'date-fns'
import { LucidePlus, LucideSearch } from 'lucide-react'
import moment from 'moment-timezone'
import { useCallback, useEffect, useState } from 'react'
import toast from 'react-hot-toast'

function TransactionsPage() {
  // states
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: moment().startOf('month').toDate(), // default is current month
    to: moment().toDate(),
  })

  const [groups, setGroups] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

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

  // get dashboard
  useEffect(() => {
    const getMyTransactions = async () => {
      const query = `?from=${toUTC(dateRange.from)}&to=${toUTC(dateRange.to)}`
      console.log('query', query)

      try {
        const { transactions } = await getMyTransactionsApi(query)
        handleGroupTransactions(transactions)
      } catch (err: any) {
        console.log(err)
        toast.error(err.message)
      } finally {
        // stop loading
        setLoading(false)
      }
    }

    getMyTransactions()
  }, [handleGroupTransactions, dateRange])

  return (
    <div>
      {/* Top */}
      <div className="flex items-center justify-between gap-2 px-21/2 py-4 md:px-21">
        <h2 className="text-lg font-bold">Transactions</h2>

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

      {/* Search & Group */}
      <div className="flex items-center justify-between gap-2 px-21/2 md:px-21">
        {/* Search */}
        <div className="flex w-full overflow-hidden rounded-lg border border-primary">
          <Button
            size="icon"
            className="w-10 rounded-r-none"
          >
            <LucideSearch />
          </Button>

          <Input
            className="rounded-l-none border-0 text-sm !ring-0"
            placeholder="Search..."
          />
        </div>

        {/* Group */}
      </div>

      {/* Groups */}
      <div className="flex flex-col gap-2">
        {groups.map(([type, group]) => (
          <TransactionTypeGroup
            type={type}
            categoryGroups={Object.entries(group).map(g => g[1])}
            key={type}
          />
        ))}
      </div>

      <CreateTransactionDialog
        trigger={
          <Button
            variant="default"
            className="fixed bottom-[calc(58px)] right-2 z-20 h-10 rounded-full"
          >
            <LucidePlus size={24} />
            Add Transaction
          </Button>
        }
      />

      <div className="pt-20" />
    </div>
  )
}

export default TransactionsPage
