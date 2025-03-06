import { useAppDispatch, useAppSelector } from '@/hooks/reduxHook'
import { useRouter } from '@/i18n/navigation'
import { deleteWallet, setCurWallet, updateWallet } from '@/lib/reducers/walletReducer'
import { checkTranType, formatCurrency } from '@/lib/string'
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
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from './ui/dropdown-menu'
import { Switch } from './ui/switch'

interface WalletCardProps {
  wallet: IWallet
  className?: string
}

function WalletCard({ wallet, className = '' }: WalletCardProps) {
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
  const [hide, setHide] = useState<boolean>(false)

  // delete wallet
  const handleDeleteWallet = useCallback(async () => {
    // start deleting
    setDeleting(true)
    toast.loading(t('Deleting wallet') + '...', { id: 'delete-wallet' })

    try {
      const { wallet: w, message } = await deleteWalletApi(wallet._id)

      if (wallets.length > 1) {
        dispatch(deleteWallet(w))
      } else {
        dispatch(updateWallet(w))
      }
      toast.success(message, { id: 'delete-wallet' })
    } catch (err: any) {
      toast.error(err.message, { id: 'delete-wallet' })
      console.log(err)
    } finally {
      // stop deleting
      setDeleting(false)
    }
  }, [dispatch, wallet._id, wallets, , t])

  // toggle hide
  const handleChangeHide = useCallback(
    async (value: any) => {
      setHide(value)

      try {
        const { wallet: w } = await updateWalletApi(wallet._id, {
          ...wallet,
          hide: value,
        })

        setHide(w.hide)
        dispatch(updateWallet(w))
      } catch (err: any) {
        console.log(err)
      }
    },
    [dispatch, wallet]
  )

  return (
    <Card
      className={cn('cursor-pointer overflow-hidden', className)}
      onClick={() => {
        dispatch(setCurWallet(wallet))
        router.push('/transactions', { locale })
      }}
    >
      <CardHeader className="py-21/2">
        <CardTitle className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-lg">
            <span>{wallet.icon}</span>
            <span>{wallet.name}</span>
          </div>

          {!deleting && !updating ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                >
                  <LucideEllipsis />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent onClick={e => e.stopPropagation()}>
                {/* MARK: Hide */}
                <Button
                  variant="ghost"
                  className="flex h-8 w-full items-center justify-start gap-2 px-2 text-violet-500"
                >
                  <Switch
                    checked={hide}
                    onCheckedChange={handleChangeHide}
                    className="bg-gray-300 data-[state=checked]:bg-violet-500"
                  />
                  {t('Hide')}
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
                  update={wallet => dispatch(updateWallet(wallet))}
                  wallet={wallet}
                  load={setUpdating}
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
                      ? t('Are you sure you want to delete this wallet?')
                      : t('deleteOnlyWalletMessage')
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
          )}
        </CardTitle>
      </CardHeader>

      {/* Content */}
      <CardContent className="flex flex-col gap-2 px-4 pb-2">
        <Item
          title={t('Balance')}
          value={wallet.income + wallet.saving + wallet.invest + wallet.transfer - wallet.expense}
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
          <Item
            title={t('Saving')}
            value={wallet.saving}
            type="saving"
          />
          <Item
            title={t('Invest')}
            value={wallet.invest}
            type="invest"
          />
          <Item
            title={t('Transfer')}
            value={wallet.transfer}
            type="transfer"
          />
        </div>
      </CardContent>

      {/* Collapse Button */}
      <Button
        className={cn(
          'flex h-6 w-full items-center justify-center rounded-none bg-primary py-1 text-secondary'
        )}
        onClick={e => {
          e.stopPropagation()
          setCollapsed(!collapsed)
        }}
      >
        <LucideChevronDown
          size={18}
          className={`trans-200 ${collapsed ? 'rotate-180' : ''}`}
        />
      </Button>
    </Card>
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
    <div className={`flex w-full items-center gap-21/2 rounded-lg border bg-secondary/30 px-21/2 py-1`}>
      <div
        className={cn(
          'flex h-10 w-10 items-center justify-center rounded-md border-2 text-white',
          background,
          border
        )}
      >
        <Icon size={24} />
      </div>
      <div className="flex flex-col">
        <p className="font-body tracking-wider">{title}</p>

        <span className="text-xl font-semibold">{currency && formatCurrency(currency, value)}</span>
      </div>
    </div>
  )
}
