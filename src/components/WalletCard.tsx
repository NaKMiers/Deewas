import { useAppSelector } from '@/hooks/reduxHook'
import { setCurWallet, updateWallet } from '@/lib/reducers/walletReducer'
import { checkTranType, formatCurrency } from '@/lib/string'
import { cn } from '@/lib/utils'
import { TransactionType } from '@/models/TransactionModel'
import { IWallet } from '@/models/WalletModel'
import { deleteWalletApi } from '@/requests'
import {
  LucideChevronDown,
  LucideEllipsis,
  LucideForward,
  LucideLoaderCircle,
  LucidePencil,
  LucideTrash,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Dispatch, SetStateAction, useCallback, useState } from 'react'
import toast from 'react-hot-toast'
import { useDispatch } from 'react-redux'
import ConfirmDialog from './dialogs/ConfirmDialog'
import UpdateWalletDialog from './dialogs/UpdateWalletDialog'
import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from './ui/dropdown-menu'

interface WalletCardProps {
  wallet: IWallet
  update?: Dispatch<SetStateAction<IWallet[]>>
  className?: string
}

function WalletCard({ wallet, update, className = '' }: WalletCardProps) {
  // hooks
  const router = useRouter()
  const dispatch = useDispatch()

  // store
  const curWallet: any = useAppSelector(state => state.wallet.curWallet)

  // states
  const [collapsed, setCollapsed] = useState<boolean>(false)
  const [updating, setUpdating] = useState<boolean>(false)
  const [deleting, setDeleting] = useState<boolean>(false)

  // delete wallet
  const handleDeleteWallet = useCallback(async () => {
    // start deleting
    setDeleting(true)
    toast.loading('Deleting wallet...', { id: 'delete-wallet' })

    try {
      const { wallet: w, message } = await deleteWalletApi(wallet._id)
      toast.success(message, { id: 'delete-wallet' })

      if (update) {
        update(prev => prev.filter(w => w._id !== wallet._id))
      }
    } catch (err: any) {
      toast.error(err.message, { id: 'delete-wallet' })
      console.log(err)
    } finally {
      // stop deleting
      setDeleting(false)
    }
  }, [update, wallet._id])

  return (
    <div className={cn(className)}>
      <Card
        className={cn(
          'cursor-pointer overflow-hidden',
          curWallet?._id === wallet._id && 'border-2 border-primary'
        )}
        onClick={() => dispatch(setCurWallet(wallet))}
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
                <DropdownMenuContent>
                  <Button
                    variant="ghost"
                    className="flex h-8 w-full items-center justify-start gap-2 px-2"
                    onClick={() => router.push(`/wallet/${wallet._id}`)}
                  >
                    <LucideForward size={16} />
                    View
                  </Button>

                  <UpdateWalletDialog
                    update={wallet => dispatch(updateWallet(wallet))}
                    wallet={wallet}
                    load={setUpdating}
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
                    label="Delete Wallet"
                    desc="Are you sure you want to delete this wallet?"
                    confirmLabel="Delete"
                    onConfirm={handleDeleteWallet}
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
          </CardTitle>
        </CardHeader>

        <CardContent className="flex flex-col gap-2 px-4 pb-2">
          <Item
            title="Balance"
            value={wallet.income - wallet.expense}
            type="balance"
          />
          <div
            className={`trans-300 flex flex-col gap-2 overflow-hidden ${collapsed ? 'max-h-[300px]' : 'max-h-0'}`}
          >
            <Item
              title="Income"
              value={wallet.income}
              type="income"
            />
            <Item
              title="Expense"
              value={wallet.expense}
              type="expense"
            />
            <Item
              title="Saving"
              value={wallet.saving}
              type="saving"
            />
            <Item
              title="Invest"
              value={wallet.invest}
              type="invest"
            />
          </div>
        </CardContent>

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
    </div>
  )
}

export default WalletCard

interface CardProps {
  title: string
  value: number
  type: TransactionType | 'balance'
  className?: string
}
function Item({ title, type, value }: CardProps) {
  // store
  const {
    settings: { currency },
    exchangeRates,
  } = useAppSelector(state => state.settings)

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

        <span className="text-xl font-semibold">
          {formatCurrency(currency, exchangeRates[currency], value)}
        </span>
      </div>
    </div>
  )
}
