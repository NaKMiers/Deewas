import { Button } from '@/components/ui/button'
import { currencies } from '@/constants/settings'
import { useAppDispatch, useAppSelector } from '@/hooks/reduxHook'
import { refresh } from '@/lib/reducers/loadReducer'
import { checkTranType, formatCurrency } from '@/lib/string'
import { formatDate, toUTC } from '@/lib/time'
import { cn } from '@/lib/utils'
import { IFullTransaction } from '@/models/TransactionModel'
import { createTransactionApi, deleteTransactionApi } from '@/requests'
import {
  LucideChevronDown,
  LucideChevronUp,
  LucideEllipsisVertical,
  LucideLayers2,
  LucideLoaderCircle,
  LucideMinusCircle,
  LucidePencil,
  LucideTrash,
} from 'lucide-react'
import moment from 'moment-timezone'
import { useTranslations } from 'next-intl'
import { memo, useCallback, useState } from 'react'
import toast from 'react-hot-toast'
import ConfirmDialog from './dialogs/ConfirmDialog'
import UpdateTransactionDrawer from './dialogs/UpdateTransactionDrawer'
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from './ui/dropdown-menu'

interface ITxItemProps {
  transaction: IFullTransaction
  className?: string
}

function TxItem({ transaction, className }: ITxItemProps) {
  // hooks
  const dispatch = useAppDispatch()
  const t = useTranslations('txItem')

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
      const { message } = await deleteTransactionApi(transaction._id)
      toast.success(message, { id: 'delete-transaction' })

      dispatch(refresh())
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
      const { message } = await createTransactionApi({
        ...transaction,
        walletId: transaction.wallet._id,
        categoryId: transaction.category._id,
        date: toUTC(moment().toDate()),
      })

      toast.success(message, { id: 'duplicate-transaction' })
      dispatch(refresh())
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
        {transaction.exclude && (
          <LucideMinusCircle
            size={16}
            color="#f97316"
            className="opacity-80"
          />
        )}
        {currency && (
          <div className="flex flex-col items-end">
            <p className="text-xs text-muted-foreground">
              {formatDate(
                moment(transaction.date).toDate(),
                currencies.find(c => c.value === currency)?.locale || 'en'
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

export default memo(TxItem)
