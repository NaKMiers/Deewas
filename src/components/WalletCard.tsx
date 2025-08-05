'use client'

import { useAppDispatch, useAppSelector } from '@/hooks/reduxHook'
import { useRouter } from '@/i18n/navigation'
import { refresh } from '@/lib/reducers/loadReducer'
import { deleteWallet, updateWallet } from '@/lib/reducers/walletReducer'
import { checkLevel, checkTranType, formatCurrency } from '@/lib/string'
import { cn } from '@/lib/utils'
import { TransactionType } from '@/models/TransactionModel'
import { IWallet } from '@/models/WalletModel'
import { deleteWalletApi, updateWalletApi } from '@/requests'
import {
  LucideArrowRightLeft,
  LucideChevronDown,
  LucideEllipsis,
  LucideLoaderCircle,
  LucidePencil,
  LucidePlus,
  LucideTrash,
} from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import { memo, useCallback, useState } from 'react'
import toast from 'react-hot-toast'
import ConfirmDialog from './dialogs/ConfirmDialog'
import CreateTransactionDrawer from './dialogs/CreateTransactionDrawer'
import TransferFundDrawer from './dialogs/TransferFundDrawer'
import UpdateWalletDrawer from './dialogs/UpdateWalletDrawer'
import { Button } from './ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from './ui/dropdown-menu'
import { Switch } from './ui/switch'

interface WalletCardProps {
  wallet: IWallet
  hideMenu?: boolean
  className?: string
}

function WalletCard({ wallet, hideMenu, className }: WalletCardProps) {
  // hooks
  const router = useRouter()
  const locale = useLocale()
  const dispatch = useAppDispatch()
  const t = useTranslations('walletCard')

  // store
  const { wallets } = useAppSelector(state => state.wallet)

  // states
  const [collapsed, setCollapsed] = useState<boolean>(false)
  const [updating, setUpdating] = useState<boolean>(false)
  const [deleting, setDeleting] = useState<boolean>(false)
  const [exclude, setExclude] = useState<boolean>(false)

  // value
  const spentRate = wallet.income
    ? Math.round(Math.min((wallet.expense / wallet.income) * 100, 100) * 100) / 100
    : 0

  // delete wallet
  const handleDeleteWallet = useCallback(async () => {
    // start deleting
    setDeleting(true)
    toast.loading(t('Deleting wallet') + '...', { id: 'delete-wallet' })

    try {
      const { wallet: w, message } = await deleteWalletApi(wallet._id)

      toast.success(message, { id: 'delete-wallet' })

      dispatch(wallets.length > 1 ? deleteWallet(w) : updateWallet(w))
      dispatch(refresh())
    } catch (err: any) {
      toast.error(err.message, { id: 'delete-wallet' })
      console.log(err)
    } finally {
      // stop deleting
      setDeleting(false)
    }
  }, [dispatch, wallet._id, wallets, , t])

  // toggle exclude
  const handleChangeExclude = useCallback(
    async (value: any) => {
      setExclude(value)

      try {
        const { wallet: w } = await updateWalletApi(wallet._id, {
          ...wallet,
          exclude: value,
        })

        setExclude(w.exclude)
        dispatch(updateWallet(w))
      } catch (err: any) {
        console.log(err)
      }
    },
    [dispatch, wallet]
  )

  return (
    <div
      className={cn(
        'cursor-pointer select-none overflow-hidden rounded-lg bg-[url(/images/pre-bg-v-flip.png)] bg-cover bg-center bg-no-repeat shadow-md',
        className
      )}
      onClick={() => router.push('/transactions', { locale })}
    >
      <div className="px-21/2 py-21/2 text-neutral-800">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-lg font-semibold">
            <span>{wallet.icon}</span>
            <span>{wallet.name}</span>
          </div>

          {!hideMenu &&
            (!deleting && !updating ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="px-2">
                    <LucideEllipsis />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent onClick={e => e.stopPropagation()}>
                  {/* MARK: exclude */}
                  <Button
                    variant="ghost"
                    className="flex h-8 w-full items-center justify-start gap-2 px-2 text-violet-500"
                  >
                    <Switch
                      checked={exclude}
                      onCheckedChange={handleChangeExclude}
                      className="bg-gray-300 data-[state=checked]:bg-violet-500"
                    />
                    {t('Exclude')}
                  </Button>

                  {/* MARK: Transfer */}
                  {wallets.length > 1 && (
                    <TransferFundDrawer
                      initFromWallet={wallet}
                      trigger={
                        <Button
                          variant="ghost"
                          className="flex h-8 w-full items-center justify-start gap-2 px-2 text-indigo-500"
                        >
                          <LucideArrowRightLeft size={16} />
                          {t('Transfer')}
                        </Button>
                      }
                    />
                  )}

                  {/* MARK: Add Transaction */}
                  <CreateTransactionDrawer
                    initWallet={wallet}
                    trigger={
                      <Button
                        variant="ghost"
                        className="flex h-8 w-full items-center justify-start gap-2 px-2"
                      >
                        <LucidePlus size={16} />
                        {t('Add Transaction')}
                      </Button>
                    }
                  />

                  {/* MARK: Edit */}
                  <UpdateWalletDrawer
                    wallet={wallet}
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
                    label={t('Delete Wallet')}
                    desc={
                      wallets.length > 1
                        ? `${t('All transactions of this wallet will be deleted')}. ${t('Are you sure you want to delete this wallet?')}`
                        : `${t('Since this is the only wallet, instead of deleting this wallet we will clear all your data and associated transactions, your categories will be safe')}. ${t('Are you sure you want to do this?')}`
                    }
                    confirmLabel={wallets.length > 1 ? 'Delete' : 'Clear'}
                    onConfirm={handleDeleteWallet}
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
            ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col gap-2 px-4 pb-2">
        <Item
          title={t('Balance')}
          value={wallet.income - wallet.expense}
          type="balance"
        />
        <div
          className={`trans-300 flex flex-col gap-2 overflow-hidden ${collapsed ? 'max-h-[400px]' : 'max-h-0'}`}
        >
          <Item
            title={t('Income')}
            value={wallet.income}
            type="income"
          />
          <Item
            title={t('Expense')}
            value={wallet.expense}
            type="expense"
          />
        </div>
      </div>

      {/* Collapse Button */}
      <Button
        className={cn('w-full flex-row items-center justify-center gap-4 rounded-none')}
        style={{ height: 32 }}
        onClick={e => {
          e.stopPropagation()
          setCollapsed(!collapsed)
        }}
      >
        {!!spentRate && (
          <div className="h-2 flex-1 rounded-lg bg-secondary">
            <div
              className={cn('h-full rounded-full', checkLevel(spentRate).background)}
              style={{ width: `${spentRate}%` }}
            />
          </div>
        )}

        <LucideChevronDown
          size={26}
          className={cn('trans-200', collapsed ? 'rotate-180' : 'rotate-0')}
        />
      </Button>
    </div>
  )
}

export default memo(WalletCard)

interface CardProps {
  title: string
  value: number
  type: TransactionType | 'balance'
  className?: string
}
function Item({ title, type, value }: CardProps) {
  // store
  const currency = useAppSelector(state => state.settings.settings?.currency)

  // values
  const { Icon, background, border } = checkTranType(type)

  return (
    <div className={`flex w-full items-center gap-21/2 rounded-lg border bg-neutral-800 px-21/2 py-1`}>
      <div
        className={cn(
          'x flex h-10 w-10 items-center justify-center rounded-md border-2 text-white',
          background,
          border
        )}
      >
        <Icon size={24} />
      </div>
      <div className="flex flex-col text-white">
        <p className="font-body tracking-wider">{title}</p>

        <span className="text-xl font-semibold">{currency && formatCurrency(currency, value)}</span>
      </div>
    </div>
  )
}
