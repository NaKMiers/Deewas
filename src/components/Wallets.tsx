'use client'

import { useAppDispatch, useAppSelector } from '@/hooks/reduxHook'
import { setWallets } from '@/lib/reducers/walletReducer'
import { cn } from '@/lib/utils'
import { IWallet } from '@/models/WalletModel'
import { LucideLoaderCircle, LucidePlusCircle, LucideRefreshCw } from 'lucide-react'
import { memo, ReactNode, useState } from 'react'
import CreateWalletDrawer from './dialogs/CreateWalletDrawer'
import { Button } from './ui/button'
import { Carousel, CarouselContent, CarouselItem } from './ui/carousel'
import { Skeleton } from './ui/skeleton'
import WalletCard from './WalletCard'
import { refetching } from '@/lib/reducers/loadReducer'
import { useTranslations } from 'next-intl'

interface WalletProps {
  className?: string
}

function Wallets({ className = '' }: WalletProps) {
  // hooks
  const dispatch = useAppDispatch()
  const t = useTranslations('wallets')

  // store
  const { wallets, loading } = useAppSelector(state => state.wallet)

  // states
  const [creating, setCreating] = useState<boolean>(false)

  return (
    <div className={cn(className)}>
      {/* Top */}
      <div className="md:px-21 flex flex-wrap items-center justify-between gap-2 px-21/2">
        <h2 className="text-lg font-bold">{t('Wallets')}</h2>

        <div className="flex items-center justify-end gap-2">
          {/* Mark: Refresh */}
          <Button
            variant="outline"
            size="icon"
            className="group h-7"
            onClick={() => dispatch(refetching())}
          >
            <LucideRefreshCw className="trans-300 group-hover:rotate-180" />
          </Button>

          {/* MARK: Create Wallet */}
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
                    {t('New Wallet')}
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
      </div>

      {/* Wallet List */}
      <SkeletonWallets
        loading={loading}
        className="mt-2"
      >
        {wallets.length > 0 ? (
          <Carousel className="md:px-21 mx-auto mt-2 px-21/2">
            <CarouselContent
              className={cn(
                wallets.length > 1 && 'sm:pr-0 lg:pr-0 pr-10',
                wallets.length > 2 && 'sm:pr-10 lg:pr-0 pr-10',
                wallets.length > 3 && 'sm:pr-10 lg:pr-10 pr-10'
              )}
            >
              {wallets.map((wallet: IWallet) => (
                <CarouselItem
                  className={cn('basic-full sm:basis-1/2 lg:basis-1/3', className)}
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
          <div className="md:px-21 mt-1 px-21/2">
            <div className="flex w-full items-center justify-center rounded-md border px-2 py-6 text-lg font-bold text-muted-foreground/50">
              {t('No wallets found')}.
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
