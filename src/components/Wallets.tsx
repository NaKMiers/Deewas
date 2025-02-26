'use client'

import { formatSymbol } from '@/lib/string'
import { cn } from '@/lib/utils'
import { IWallet } from '@/models/WalletModel'
import { deleteWalletApi, getMyWalletsApi } from '@/requests'
import {
  Link,
  LucideChartNoAxesCombined,
  LucideChevronDown,
  LucideEllipsis,
  LucideForward,
  LucideHandCoins,
  LucideLoaderCircle,
  LucidePencil,
  LucidePlusCircle,
  LucideTrash,
  LucideTrendingDown,
  LucideTrendingUp,
  LucideWalletCards,
} from 'lucide-react'
import { Dispatch, ReactNode, SetStateAction, useCallback, useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import ConfirmDialog from './ConfirmDialog'
import CreateWalletDialog from './CreateWalletDialog'
import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Carousel, CarouselContent, CarouselItem } from './ui/carousel'
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from './ui/dropdown-menu'
import UpdateWalletDialog from './UpdateWalletDialog'
import { DropdownMenuItem } from '@radix-ui/react-dropdown-menu'
import { useRouter } from 'next/navigation'

interface WalletProps {
  className?: string
}

function Wallets({ className = '' }: WalletProps) {
  // states
  const [wallets, setWallets] = useState<IWallet[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [creating, setCreating] = useState<boolean>(false)

  // get wallets
  useEffect(() => {
    async function getWallets() {
      // start loading
      setLoading(true)

      try {
        const { wallets } = await getMyWalletsApi()
        setWallets(wallets)
        console.log('wallets', wallets)
      } catch (err: any) {
        console.log(err)
      } finally {
        // stop loading
        setLoading(false)
      }
    }

    getWallets()
  }, [])

  return (
    <div className={cn(className)}>
      {/* Top */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-21/2 md:px-21">
        <h2 className="text-lg font-bold">Wallets</h2>

        <CreateWalletDialog
          update={setWallets}
          load={setCreating}
          trigger={
            <Button
              disabled={creating}
              variant="outline"
              className="h-7 px-3 text-xs font-semibold"
            >
              {!creating ? (
                <>
                  New Wallet
                  <LucidePlusCircle
                    size={16}
                    className=""
                  />
                </>
              ) : (
                <LucideLoaderCircle className="animate-spin" />
              )}
            </Button>
          }
        />
      </div>

      {/* Wallet List */}
      <SkeletonWallets loading={loading}>
        <Carousel className="mt-1 w-full px-2">
          <CarouselContent>
            {wallets.map(wallet => (
              <CarouselItem
                className={cn('md:basis-1/2 lg:basis-1/3', className)}
                key={wallet._id}
              >
                <WalletCard
                  wallet={wallet}
                  update={setWallets}
                />
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </SkeletonWallets>
    </div>
  )
}

export default Wallets

export function SkeletonWallets({ loading, children }: { loading: boolean; children: ReactNode }) {
  return loading ? (
    <div className="px-21/2">
      <div className="loading mt-2 h-[162px] w-full rounded-lg px-2" />
    </div>
  ) : (
    children
  )
}

interface WalletCardProps {
  wallet: IWallet
  update?: Dispatch<SetStateAction<IWallet[]>>
  className?: string
}

export function WalletCard({ wallet, update, className = '' }: WalletCardProps) {
  // hooks
  const router = useRouter()

  // states
  const [collapsed, setCollapsed] = useState<boolean>(false)
  const [updating, setUpdating] = useState<boolean>(false)
  const [deleting, setDeleting] = useState<boolean>(false)

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
    <div className={cn('p-1', className)}>
      <Card className="overflow-hidden">
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
                    update={update}
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
            icon={
              <div className="flex h-10 w-10 items-center justify-center rounded-md border-2 border-sky-500 bg-sky-950 text-white">
                <LucideWalletCards size={24} />
              </div>
            }
            title="Balance"
            value={1000000}
            currency="USD"
          />
          <div
            className={`trans-300 flex flex-col gap-2 overflow-hidden ${collapsed ? 'max-h-[300px]' : 'max-h-0'}`}
          >
            <Item
              icon={
                <div className="flex h-10 w-10 items-center justify-center rounded-md border-2 border-emerald-500 bg-emerald-950 text-white">
                  <LucideTrendingUp size={24} />
                </div>
              }
              title="Income"
              value={1000000}
              currency="USD"
            />
            <Item
              icon={
                <div className="flex h-10 w-10 items-center justify-center rounded-md border-2 border-rose-500 bg-rose-950 text-white">
                  <LucideTrendingDown size={24} />
                </div>
              }
              title="Expense"
              value={1000000}
              currency="USD"
            />
            <Item
              icon={
                <div className="flex h-10 w-10 items-center justify-center rounded-md border-2 border-yellow-500 bg-yellow-950 text-white">
                  <LucideHandCoins size={24} />
                </div>
              }
              title="Saving"
              value={1000000}
              currency="USD"
            />
            <Item
              icon={
                <div className="flex h-10 w-10 items-center justify-center rounded-md border-2 border-violet-500 bg-violet-950 text-white">
                  <LucideChartNoAxesCombined size={24} />
                </div>
              }
              title="Invest"
              value={1000000}
              currency="USD"
            />
          </div>
        </CardContent>
        <button
          className="flex w-full items-center justify-center bg-primary py-1 text-secondary"
          onClick={() => setCollapsed(!collapsed)}
        >
          <LucideChevronDown
            size={18}
            className={`trans-200 ${collapsed ? 'rotate-180' : ''}`}
          />
        </button>
      </Card>
    </div>
  )
}

interface CardProps {
  icon: ReactNode
  title: string
  value: number
  currency: string
  className?: string
}
function Item({ icon, title, value, currency }: CardProps) {
  return (
    <div className={`flex w-full items-center gap-21/2 rounded-lg border bg-secondary/30 px-21/2 py-1`}>
      {icon}
      <div className="flex flex-col">
        <p className="font-body tracking-wider">{title}</p>

        <span className="text-xl font-semibold">{formatSymbol(currency) + ' ' + value}</span>
      </div>
    </div>
  )
}
