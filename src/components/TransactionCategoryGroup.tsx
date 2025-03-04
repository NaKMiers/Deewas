import { Button } from '@/components/ui/button'
import { currencies } from '@/constants/settings'
import { useAppDispatch, useAppSelector } from '@/hooks/reduxHook'
import { addTransaction, deleteTransaction, updateTransaction } from '@/lib/reducers/transactionReducer'
import { checkTranType, formatCurrency } from '@/lib/string'
import { formatDate } from '@/lib/time'
import { cn } from '@/lib/utils'
import { ICategory } from '@/models/CategoryModel'
import { IFullTransaction } from '@/models/TransactionModel'
import { deleteTransactionApi } from '@/requests/transactionRequests'
import {
  LucideChevronDown,
  LucideChevronUp,
  LucideEllipsisVertical,
  LucideLoaderCircle,
  LucidePencil,
  LucidePlusSquare,
  LucideTrash,
} from 'lucide-react'
import moment from 'moment-timezone'
import { useTranslations } from 'next-intl'
import { memo, useCallback, useState } from 'react'
import toast from 'react-hot-toast'
import ConfirmDialog from './dialogs/ConfirmDialog'
import CreateTransactionDrawer from './dialogs/CreateTransactionDrawer'
import UpdateTransactionDrawer from './dialogs/UpdateTransactionDrawer'
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from './ui/dropdown-menu'

interface ITransactionCategoryGroupProps {
  category: ICategory
  transactions: IFullTransaction[]
  className?: string
}

function TransactionCategoryGroup({
  category,
  transactions,
  className = '',
}: ITransactionCategoryGroupProps) {
  // hooks
  const dispatch = useAppDispatch()
  const t = useTranslations('transactionCategoryGroup')

  // store
  const currency = useAppSelector(state => state.settings.settings?.currency)

  return (
    <div className={cn('flex flex-col', className)}>
      <div className="flex items-center justify-between gap-2 py-0.5">
        <div className="flex items-start gap-2">
          <span>{category.icon}</span>
          {currency && (
            <div className="flex flex-col">
              <span className="text-sm font-semibold">{category.name}</span>
              <span
                className={cn(
                  '-mb-1 -mt-0.5 ml-0.5 text-xs tracking-tight',
                  checkTranType(category.type).color
                )}
              >
                {formatCurrency(currency, category.amount)}
              </span>
            </div>
          )}
        </div>

        {/* New Transaction for category */}
        <CreateTransactionDrawer
          category={category}
          update={(transaction: IFullTransaction) => dispatch(addTransaction(transaction))}
          trigger={
            <Button
              variant="outline"
              className="flex h-7 items-center gap-1.5 rounded-md px-2 text-xs"
            >
              <LucidePlusSquare />
              {t('Add Transaction')}
            </Button>
          }
        />
      </div>

      {/* Transactions of category */}
      <div className="my-1.5 pl-2">
        <div className="flex flex-col gap-0 border-l">
          {transactions.map(transaction => (
            <TransactionItem
              transaction={transaction}
              key={transaction._id}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export default memo(TransactionCategoryGroup)

interface ITransactionProps {
  transaction: IFullTransaction
  className?: string
}

function TransactionItem({ transaction, className = '' }: ITransactionProps) {
  // hooks
  const dispatch = useAppDispatch()
  const t = useTranslations('transactionItem')

  // store
  const currency = useAppSelector(state => state.settings.settings?.currency)

  // states
  const [deleting, setDeleting] = useState<boolean>(false)

  // delete transaction
  const handleDeleteTransaction = useCallback(async () => {
    // start loading
    setDeleting(true)
    toast.loading(t('Deleting transaction') + '...', { id: 'delete-transaction' })

    try {
      const { transaction: tx, message } = await deleteTransactionApi(transaction._id)
      toast.success(message, { id: 'delete-transaction' })

      dispatch(deleteTransaction(tx))
    } catch (err: any) {
      toast.error(t('Failed to delete transaction'), { id: 'delete-transaction' })
      console.log(err)
    } finally {
      // stop loading
      setDeleting(false)
    }
  }, [dispatch, transaction._id, t])

  return (
    <div className={cn('flex w-full items-center justify-between gap-2 pl-2', className)}>
      <p className="text-sm font-semibold">{transaction.name}</p>

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
                update={(transaction: IFullTransaction) => dispatch(updateTransaction(transaction))}
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

              <ConfirmDialog
                label={t('Delete Transaction')}
                desc={t('Are you sure you want to delete this transaction?')}
                confirmLabel={t('Delete')}
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
  )
}
