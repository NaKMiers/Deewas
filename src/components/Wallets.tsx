'use client'

import { useAppDispatch, useAppSelector } from '@/hooks/reduxHook'
import { setWallets } from '@/lib/reducers/walletReducer'
import { cn } from '@/lib/utils'
import { IWallet } from '@/models/WalletModel'
import { LucideLoaderCircle, LucidePlusCircle } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { memo, useState } from 'react'
import CreateWalletDrawer from './dialogs/CreateWalletDrawer'
import { Button } from './ui/button'
import { Carousel, CarouselContent, CarouselItem } from './ui/carousel'
import WalletCard from './WalletCard'

interface WalletProps {
  className?: string
}

function Wallets({ className }: WalletProps) {
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
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-bold">{t('Wallets')}</h2>

        {/* MARK: Create Wallet */}
        <CreateWalletDrawer
          update={wallet => dispatch(setWallets([wallet, ...wallets]))}
          load={setCreating}
          trigger={
            <Button
              disabled={creating}
              variant="default"
              className="h-8 px-3 text-sm shadow-md"
            >
              {!creating ? (
                <>
                  {t('New Wallet')}
                  <LucidePlusCircle size={16} />
                </>
              ) : (
                <LucideLoaderCircle className="animate-spin" />
              )}
            </Button>
          }
        />
      </div>

      {/* Wallet List */}

      {wallets.length > 0 ? (
        <Carousel className="mx-auto mt-2">
          <CarouselContent
            className={cn(
              wallets.length > 1 && 'pr-10 sm:pr-0 lg:pr-0',
              wallets.length > 2 && 'pr-10 sm:pr-10 lg:pr-0',
              wallets.length > 3 && 'pr-10 sm:pr-10 lg:pr-10'
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
        <div className="mt-1">
          <div className="flex w-full items-center justify-center rounded-md border px-2 py-6 text-lg font-bold text-muted-foreground/50">
            {t('No wallets found')}.
          </div>
        </div>
      )}
    </div>
  )
}

export default memo(Wallets)
