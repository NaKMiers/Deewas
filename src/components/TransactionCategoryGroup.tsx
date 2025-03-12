import { Button } from '@/components/ui/button'
import { currencies } from '@/constants/settings'
import { useAppDispatch, useAppSelector } from '@/hooks/reduxHook'
import { refetching } from '@/lib/reducers/loadReducer'
import { addTransaction, updateTransaction } from '@/lib/reducers/transactionReducer'
import { checkTranType, formatCurrency } from '@/lib/string'
import { formatDate, toUTC } from '@/lib/time'
import { cn } from '@/lib/utils'
import { ICategory } from '@/models/CategoryModel'
import { IFullTransaction } from '@/models/TransactionModel'
import { createTransactionApi, deleteTransactionApi } from '@/requests'
import { motion } from 'framer-motion'
import {
  LucideChevronDown,
  LucideChevronUp,
  LucideEllipsisVertical,
  LucideLayers2,
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

        {/* MARK: New Transaction for category */}
        <CreateTransactionDrawer
          initCategory={category}
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

      {/*  MARK: Transactions of category */}
      <div className="my-1.5 pl-2">
        <div className="flex flex-col gap-0 border-l">
          {transactions.map((tx, index) => (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * index }}
              key={tx._id}
            >
              <TransactionItem transaction={tx} />
            </motion.div>
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
  const [duplicating, setDuplicating] = useState<boolean>(false)

  // delete transaction
  const handleDeleteTransaction = useCallback(async () => {
    // start loading
    setDeleting(true)
    toast.loading(t('Deleting transaction') + '...', { id: 'delete-transaction' })

    try {
      const { transaction: tx, message } = await deleteTransactionApi(transaction._id)
      toast.success(message, { id: 'delete-transaction' })

      dispatch(refetching())
    } catch (err: any) {
      toast.error(t('Failed to delete transaction'), { id: 'delete-transaction' })
      console.log(err)
    } finally {
      // stop loading
      setDeleting(false)
    }
  }, [dispatch, transaction._id, t])

  // duplicate transaction
  const handleDuplicateTransaction = useCallback(async () => {
    // start loading
    setDuplicating(true)
    toast.loading(t('Duplicating transaction') + '...', { id: 'duplicate-transaction' })

    try {
      const { transaction: tx, message } = await createTransactionApi({
        ...transaction,
        walletId: transaction.wallet._id,
        categoryId: transaction.category._id,
        date: toUTC(moment().toDate()),
      })

      toast.success(message, { id: 'duplicate-transaction' })
      dispatch(refetching())
    } catch (err: any) {
      toast.error(t('Failed to duplicate transaction'), { id: 'duplicate-transaction' })
      console.log(err)
    } finally {
      // stop loading
      setDuplicating(false)
    }
  }, [dispatch, transaction, t])

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

              {/* MARK: Delete */}
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
