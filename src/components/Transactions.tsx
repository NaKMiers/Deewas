import { currencies } from '@/constants/settings'
import { useAppSelector } from '@/hooks/reduxHook'
import { checkTranType, formatCurrency } from '@/lib/string'
import { formatDate } from '@/lib/time'
import { cn } from '@/lib/utils'
import { IFullTransaction } from '@/models/TransactionModel'
import { deleteTransactionApi, getMyTransactionsApi } from '@/requests/transactionRequests'
import {
  LucideChevronDown,
  LucideChevronUp,
  LucideEllipsisVertical,
  LucideLoaderCircle,
  LucidePencil,
  LucideTrash,
} from 'lucide-react'
import moment from 'moment-timezone'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import ConfirmDialog from './dialogs/ConfirmDialog'
import UpdateTransactionDrawer from './dialogs/UpdateTransactionDrawer'
import { Button } from './ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from './ui/dropdown-menu'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'

interface TransactionsProps {
  className?: string
}

function Transactions({ className = '' }: TransactionsProps) {
  // hooks
  const router = useRouter()

  // states
  const [transactions, setTransactions] = useState<IFullTransaction[]>([])
  const [limit, setLimit] = useState<string>('10')
  const [loading, setLoading] = useState<boolean>(false)

  // get latest transactions
  useEffect(() => {
    const getLatestTransactions = async () => {
      // start loading
      setLoading(true)

      try {
        const { transactions } = await getMyTransactionsApi(`?sort=date&orderBy=-1&limit=${limit}`)
        setTransactions(transactions)
      } catch (err: any) {
        toast.error(err.message)
        console.log(err)
      } finally {
        // stop loading
        setLoading(false)
      }
    }

    getLatestTransactions()
  }, [limit])

  return (
    <div className={cn('px-21/2 md:px-21', className)}>
      {/* Top */}
      <div className="flex items-center justify-between gap-1">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-bold">Latest</h2>

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
          onClick={() => router.push('/transactions')}
        >
          All
        </Button>
      </div>

      <div className="mt-2 flex flex-col gap-2 rounded-lg border p-21/2 md:p-21">
        {transactions.slice(0, +limit).length > 0 ? (
          transactions.slice(0, +limit).map(transaction => (
            <Transaction
              transaction={transaction}
              key={transaction._id}
            />
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

export default Transactions

interface TransactionProps {
  transaction: IFullTransaction
  refetch?: () => void
  className?: string
}

function Transaction({ transaction, refetch, className = '' }: TransactionProps) {
  // store
  const currency = useAppSelector(state => state.settings.settings?.currency)

  // states
  const [deleting, setDeleting] = useState<boolean>(false)

  // delete transaction
  const handleDeleteTransaction = useCallback(async () => {
    // start loading
    setDeleting(true)
    toast.loading('Deleting transaction...', { id: 'delete-transaction' })

    try {
      const { message } = await deleteTransactionApi(transaction._id)
      toast.success(message, { id: 'delete-transaction' })

      if (refetch) refetch()
    } catch (err: any) {
      toast.error('Failed to delete transaction', { id: 'delete-transaction' })
      console.log(err)
    } finally {
      // stop loading
      setDeleting(false)
    }
  }, [refetch, transaction._id])

  return (
    <div className={cn('flex w-full items-start gap-1', className)}>
      {/* Icon */}
      <span className="text-2xl">{transaction.category.icon}</span>

      {/* Content */}
      <div className="flex w-full items-center justify-between gap-2">
        {/* Left */}
        <div className="flex flex-col">
          <p className="text-xs font-semibold tracking-wide text-muted-foreground">
            {transaction.category.name}
          </p>

          <div className="flex flex-wrap items-center gap-x-2">
            <p className="text-sm font-semibold leading-4">{transaction.name}</p>
          </div>
        </div>

        {/* Right */}
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

          {!deleting ? (
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
                <UpdateTransactionDrawer
                  transaction={transaction}
                  refetch={refetch}
                  trigger={
                    <Button
                      variant="ghost"
                      className="flex h-8 w-full items-center justify-start gap-2 px-2 text-sky-500"
                    >
                      <LucidePencil size={16} />
                      Edit
                    </Button>
                  }
                />

                <ConfirmDialog
                  label="Delete Transaction"
                  desc="Are you sure you want to delete this transaction?"
                  confirmLabel="Delete"
                  onConfirm={handleDeleteTransaction}
                  trigger={
                    <Button
                      variant="ghost"
                      className="flex h-8 w-full items-center justify-start gap-2 px-2 text-rose-500"
                    >
                      <LucideTrash size={16} />
                      Delete
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
