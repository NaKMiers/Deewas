import { Button } from '@/components/ui/button'
import { useAppSelector } from '@/hooks/reduxHook'
import { checkTranType, formatCurrency } from '@/lib/string'
import { cn } from '@/lib/utils'
import { ICategory } from '@/models/CategoryModel'
import { IFullTransaction } from '@/models/TransactionModel'
import { deleteTransactionApi } from '@/requests/transactionRequests'
import {
  LucideChevronDown,
  LucideChevronUp,
  LucideEllipsisVertical,
  LucidePencil,
  LucidePlusSquare,
  LucideTrash,
} from 'lucide-react'
import { useCallback, useState } from 'react'
import toast from 'react-hot-toast'
import ConfirmDialog from './dialogs/ConfirmDialog'
import CreateTransactionDialog from './dialogs/CreateTransactionDialog'
import UpdateTransactionDialog from './dialogs/UpdateTransactionDialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from './ui/dropdown-menu'

interface ITransactionCategoryGroupProps {
  category: ICategory
  transactions: IFullTransaction[]
  refetch?: () => void
  className?: string
}

function TransactionCategoryGroup({
  category,
  transactions,
  refetch,
  className = '',
}: ITransactionCategoryGroupProps) {
  // store
  const {
    settings: { currency },
    exchangeRates,
  } = useAppSelector(state => state.settings)

  return (
    <div className={cn('flex flex-col', className)}>
      <div className="flex items-center justify-between gap-2 py-0.5">
        <div className="flex items-center gap-2">
          <span>{category.icon}</span>
          <span className="text-sm font-semibold">{category.name}</span>
          <span className={cn('-mb-1 text-xs tracking-tight', checkTranType(category.type).color)}>
            {formatCurrency(currency, category.amount, exchangeRates[currency])}
          </span>
        </div>

        {/* New Transaction for category */}
        <CreateTransactionDialog
          category={category}
          refetch={refetch}
          trigger={
            <Button
              variant="outline"
              className="flex h-7 items-center gap-1.5 rounded-md px-2 text-xs"
            >
              <LucidePlusSquare />
              New Transaction
            </Button>
          }
        />
      </div>

      {/* Transactions of category */}
      <div className="my-1.5 pl-2">
        <div className="flex flex-col gap-0 border-l">
          {transactions.map(transaction => (
            <Transaction
              refetch={refetch}
              transaction={transaction}
              key={transaction._id}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export default TransactionCategoryGroup

interface ITransactionProps {
  refetch?: () => void
  transaction: IFullTransaction
  className?: string
}

function Transaction({ transaction, refetch, className = '' }: ITransactionProps) {
  // store
  const {
    settings: { currency },
    exchangeRates,
  } = useAppSelector(state => state.settings)

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
    <div className={cn('flex h-8 w-full items-center justify-between gap-2 pl-2', className)}>
      <div className="flex items-center gap-2">
        <p className="text-sm font-semibold">{transaction.name}</p>
      </div>

      <div className="flex items-center gap-1">
        <div className={cn('flex items-center gap-1', checkTranType(transaction.type).color)}>
          {transaction.type === 'expense' ? (
            <LucideChevronDown size={16} />
          ) : (
            <LucideChevronUp size={16} />
          )}
          <span className="text-sm font-semibold">
            {formatCurrency(currency, transaction.amount, exchangeRates[currency])}
          </span>
        </div>

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
            <UpdateTransactionDialog
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
      </div>
    </div>
  )
}
