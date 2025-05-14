'use client'

import { useAppDispatch, useAppSelector } from '@/hooks/reduxHook'
import { refresh } from '@/lib/reducers/loadReducer'
import { cn } from '@/lib/utils'
import { IFullTransaction } from '@/models/TransactionModel'
import { getMyTransactionsApi } from '@/requests'
import { motion } from 'framer-motion'
import { useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { memo, useCallback, useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import Transaction from './Transaction'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'

interface LatestTransactionsProps {
  className?: string
}

function LatestTransactions({ className }: LatestTransactionsProps) {
  // hooks
  const dispatch = useAppDispatch()
  const { data: session } = useSession()
  const user = session?.user
  const t = useTranslations('latestTransactions')

  // store
  const { refreshPoint } = useAppSelector(state => state.load)

  // states
  const [transactions, setTransactions] = useState<IFullTransaction[]>([])
  const [limit, setLimit] = useState<string>('10')
  const [loading, setLoading] = useState<boolean>(false)

  const getLatestTransactions = useCallback(async () => {
    if (!user) return

    // start loading
    setLoading(true)

    try {
      const { transactions } = await getMyTransactionsApi(
        `?sort=date|-1&sort=createdAt|-1&limit=${limit}`
      )
      setTransactions(transactions)
    } catch (err: any) {
      toast.error(err.message)
      console.log(err)
    } finally {
      // stop loading
      setLoading(false)
    }
  }, [user, limit])

  // get latest transactions
  useEffect(() => {
    getLatestTransactions()
  }, [getLatestTransactions, refreshPoint])

  return (
    <div className={cn(className)}>
      {/* Top */}
      <div className="flex items-center gap-2">
        <h2 className="text-lg font-bold">{t('Latest')}</h2>

        <Select
          value={limit}
          onValueChange={setLimit}
        >
          <SelectTrigger className="h-8 max-w-max gap-1.5 border border-primary/10 bg-secondary/50 text-sm shadow-md !ring-0">
            <SelectValue placeholder="Select a fruit" />
          </SelectTrigger>
          <SelectContent>
            {[5, 10, 20, 30, 50, 100].map(value => (
              <SelectItem
                key={value}
                value={value.toString()}
                className="cursor-pointer"
              >
                {value}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* MARK: Transaction List */}
      <div className="mt-2 flex flex-col gap-2 rounded-lg border border-primary/10 bg-secondary/50 p-21/2 shadow-md md:p-21">
        {transactions.slice(0, +limit).length > 0 ? (
          transactions.slice(0, +limit).map((tx, index) => (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * index }}
              key={tx._id}
            >
              <Transaction
                transaction={tx}
                update={(transaction: IFullTransaction) => {
                  setTransactions(transactions.map(t => (t._id === transaction._id ? transaction : t)))
                  dispatch(refresh())
                }}
                refetch={() => getLatestTransactions()}
              />
            </motion.div>
          ))
        ) : (
          <p className="flex items-center justify-center rounded-lg py-5 text-lg font-semibold text-muted-foreground">
            No transactions found
          </p>
        )}
      </div>
    </div>
  )
}

export default memo(LatestTransactions)
