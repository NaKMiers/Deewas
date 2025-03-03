'use client'

import { useAppDispatch, useAppSelector } from '@/hooks/reduxHook'
import { setWallets } from '@/lib/reducers/walletReducer'
import { cn } from '@/lib/utils'
import { IWallet } from '@/models/WalletModel'
import { LucideLoaderCircle, LucidePlusCircle } from 'lucide-react'
import { memo, ReactNode, useState } from 'react'
import CreateWalletDrawer from './dialogs/CreateWalletDrawer'
import { Button } from './ui/button'
import { Carousel, CarouselContent, CarouselItem } from './ui/carousel'
import { Skeleton } from './ui/skeleton'
import WalletCard from './WalletCard'

interface WalletProps {
  className?: string
}

function Wallets({ className = '' }: WalletProps) {
  // hooks
  const dispatch = useAppDispatch()

  // store
  const { wallets, loading } = useAppSelector(state => state.wallet)

  // states
  const [creating, setCreating] = useState<boolean>(false)

  return (
    <div className={cn(className)}>
      {/* Top */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-21/2 md:px-21">
        <h2 className="text-lg font-bold">Wallets</h2>

        <CreateWalletDrawer
          update={wallet => dispatch(setWallets([wallet, ...wallets]))}
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
      <SkeletonWallets
        loading={loading}
        className="mt-2"
      >
        {wallets.length > 0 ? (
          <Carousel className="mx-auto mt-2 px-21/2 md:px-21">
            <CarouselContent>
              {wallets.map((wallet: IWallet) => (
                <CarouselItem
                  className={cn(
                    'basis-[calc(100%-40px)] md:basis-[calc(50%-40px)] lg:basis-1/3',
                    className
                  )}
                  key={wallet._id}
                >
                  <WalletCard
                    wallet={wallet}
                    className="p"
                  />
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        ) : (
          <div className="mt-1 px-21/2 md:px-21">
            <div className="flex w-full items-center justify-center rounded-md border px-2 py-6 text-lg font-bold text-muted-foreground/50">
              No wallets found.
            </div>
          </div>
        )}
      </SkeletonWallets>
    </div>
  )
}

export default memo(Wallets)

export function SkeletonWallets({
  loading,
  children,
  className = '',
}: {
  loading: boolean
  children: ReactNode
  className?: string
}) {
  return loading ? (
    <div className={cn('px-21/2', className)}>
      <Skeleton className="loading h-[162px] w-full rounded-lg px-2" />
    </div>
  ) : (
    children
  )
}
