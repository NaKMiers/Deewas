'use client'

import { currencies } from '@/constants/settings'
import { useAppDispatch, useAppSelector } from '@/hooks/reduxHook'
import { useRouter } from '@/i18n/navigation'
import { refetching } from '@/lib/reducers/loadReducer'
import { checkTranType, formatCurrency } from '@/lib/string'
import { formatDate, toUTC } from '@/lib/time'
import { cn } from '@/lib/utils'
import { IFullTransaction } from '@/models/TransactionModel'
import { createTransactionApi, deleteTransactionApi, getMyTransactionsApi } from '@/requests'
import { motion } from 'framer-motion'
import {
  LucideChevronDown,
  LucideChevronUp,
  LucideEllipsisVertical,
  LucideLayers2,
  LucideLoaderCircle,
  LucidePencil,
  LucideTrash,
} from 'lucide-react'
import moment from 'moment-timezone'
import { useSession } from 'next-auth/react'
import { useLocale, useTranslations } from 'next-intl'
import { memo, useCallback, useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import ConfirmDialog from './dialogs/ConfirmDialog'
import UpdateTransactionDrawer from './dialogs/UpdateTransactionDrawer'
import { Button } from './ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from './ui/dropdown-menu'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'

interface LatestTransactionsProps {
  className?: string
}

function LatestTransactions({ className }: LatestTransactionsProps) {
  // hooks
  const router = useRouter()
  const dispatch = useAppDispatch()
  const locale = useLocale()
  const { data: session } = useSession()
  const user = session?.user
  const t = useTranslations('latestTransactions')

  // store
  const { refetching: rfc } = useAppSelector(state => state.load)

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
  }, [getLatestTransactions, rfc])

  return (
    <div className={cn('px-21/2 md:px-21', className)}>
      {/* Top */}
      <div className="flex items-center justify-between gap-1">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-bold">{t('Latest')}</h2>

          <Select
            value={limit}
            onValueChange={setLimit}
          >
            <SelectTrigger className="h-8 max-w-max gap-1.5 text-sm">
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

        <Button
          variant="outline"
          className="h-8"
          onClick={() => router.push('/transactions', { locale })}
        >
          {t('All')}
        </Button>
      </div>

      {/* MARK: Transaction List */}
      <div className="mt-2 flex flex-col gap-2 rounded-lg border p-21/2 md:p-21">
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
                  dispatch(refetching())
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

interface TransactionProps {
  transaction: IFullTransaction
  update?: (transaction: IFullTransaction) => void
  remove?: (transaction: IFullTransaction) => void
  refetch?: () => void
  className?: string
}

export function Transaction({ transaction, update, remove, refetch, className }: TransactionProps) {
  // hooks
  const t = useTranslations('transaction')

  // store
  const currency = useAppSelector(state => state.settings.settings?.currency)

  // states
  const [deleting, setDeleting] = useState<boolean>(false)
  const [duplicating, setDuplicating] = useState<boolean>(false)

  // delete transaction
  const handleDeleteTransaction = useCallback(async () => {
    // start loading
    setDuplicating(true)
    toast.loading(t('Duplicating transaction') + '...', { id: 'delete-transaction' })

    try {
      const { transaction: tx, message } = await deleteTransactionApi(transaction._id)
      toast.success(message, { id: 'delete-transaction' })

      if (remove) remove(tx)
      if (refetch) refetch()
    } catch (err: any) {
      toast.error(t('Failed to delete transaction'), { id: 'delete-transaction' })
      console.log(err)
    } finally {
      // stop loading
      setDuplicating(false)
    }
  }, [remove, refetch, transaction._id, t])

  // duplicate transaction
  const handleDuplicateTransaction = useCallback(async () => {
    // start loading
    setDeleting(true)
    toast.loading(t('Duplicating transaction') + '...', { id: 'duplicate-transaction' })

    try {
      const { transaction: tx, message } = await createTransactionApi({
        ...transaction,
        walletId: transaction.wallet._id,
        categoryId: transaction.category._id,
        date: toUTC(moment().toDate()),
      })

      toast.success(message, { id: 'duplicate-transaction' })
      if (refetch) refetch()
    } catch (err: any) {
      toast.error(t('Failed to duplicate transaction'), { id: 'duplicate-transaction' })
      console.log(err)
    } finally {
      // stop loading
      setDeleting(false)
    }
  }, [refetch, transaction, t])

  return (
    <div className={cn('flex w-full items-start gap-1', className)}>
      {/* Icon */}
      <span className="text-2xl">{transaction.category.icon}</span>

      {/* Content */}
      <div className="flex w-full items-center justify-between gap-2">
        {/* MARK: Left */}
        <div className="flex flex-col">
          <p className="text-xs font-semibold tracking-wide text-muted-foreground">
            {transaction.category.name}
          </p>

          <div className="flex flex-wrap items-center gap-x-2">
            <p className="text-sm font-semibold leading-4">{transaction.name}</p>
          </div>
        </div>

        {/* MARK: Right */}
        <div className="flex items-center gap-1">
          {currency && (
            <div className="flex flex-col items-end">
              <p className="text-xs text-muted-foreground">
                {formatDate(
                  moment(transaction.date).toDate(),
                  currencies.find(c => c.value === currency)?.locale
                )}
              </p>
              <div className={cn('flex items-center gap-1', checkTranType(transaction.type).color)}>
                {transaction.type === 'expense' ? (
                  <LucideChevronDown size={16} />
                ) : (
                  <LucideChevronUp size={16} />
                )}
                <span className="text-sm font-semibold">
                  {formatCurrency(currency, transaction.amount)}
                </span>
              </div>
            </div>
          )}

          {!deleting && !duplicating ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                >
                  <LucideEllipsisVertical />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {/* MARK: Duplicate */}
                <ConfirmDialog
                  label={t('Duplicate Transaction')}
                  desc={t('Are you sure you want to duplicate this transaction?')}
                  confirmLabel={t('Duplicate')}
                  cancelLabel={t('Cancel')}
                  onConfirm={handleDuplicateTransaction}
                  trigger={
                    <Button
                      variant="ghost"
                      className="flex h-8 w-full items-center justify-start gap-2 px-2 text-violet-500"
                    >
                      <LucideLayers2 size={16} />
                      {t('Duplicate')}
                    </Button>
                  }
                />

                {/* MARK: Update */}
                <UpdateTransactionDrawer
                  transaction={transaction}
                  update={update}
                  refetch={refetch}
                  trigger={
                    <Button
                      variant="ghost"
                      className="flex h-8 w-full items-center justify-start gap-2 px-2 text-sky-500"
                    >
                      <LucidePencil size={16} />
                      {t('Edit')}
                    </Button>
                  }
                />

                {/* MARK: Delete */}
                <ConfirmDialog
                  label={t('Delete Transaction')}
                  desc={t('Are you sure you want to delete this transaction?')}
                  confirmLabel="Delete"
                  onConfirm={handleDeleteTransaction}
                  trigger={
                    <Button
                      variant="ghost"
                      className="flex h-8 w-full items-center justify-start gap-2 px-2 text-rose-500"
                    >
                      <LucideTrash size={16} />
                      {t('Delete')}
                    </Button>
                  }
                />
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button
              disabled
              variant="ghost"
              size="icon"
            >
              <LucideLoaderCircle className="animate-spin" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
