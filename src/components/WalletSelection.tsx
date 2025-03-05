'use client'

import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useAppSelector } from '@/hooks/reduxHook'
import { cn } from '@/lib/utils'
import { IWallet } from '@/models/WalletModel'
import { LucideChevronsUpDown } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { memo, useEffect, useState } from 'react'

interface WalletSelectionProps {
  initWallet?: IWallet
  update?: (wallet: any) => void
  allowAll?: boolean
  className?: string
}

function WalletSelection({ initWallet, update, allowAll, className = '' }: WalletSelectionProps) {
  // hooks
  const t = useTranslations('walletSelection')

  // store
  const { curWallet, wallets } = useAppSelector(state => state.wallet)

  // states
  const [openWalletSelection, setOpenWalletSelection] = useState<boolean>(false)
  const [wallet, setWallet] = useState<IWallet | null>(initWallet || curWallet)

  // auto select wallet
  useEffect(() => {
    if (!initWallet && curWallet) {
      curWallet && setWallet(curWallet)
    }
  }, [initWallet, curWallet])

  return (
    <Popover
      open={openWalletSelection}
      onOpenChange={setOpenWalletSelection}
    >
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn('flex h-8 gap-2 px-2', className)}
        >
          <p>
            <span>{wallet?.icon || '🔢'}</span> {wallet?.name || 'All wallets'}
          </p>
          <div className="flex flex-1 items-center justify-end">
            <LucideChevronsUpDown size={18} />
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className={cn('w-full p-0 shadow-md')}>
        {/* Search Bar */}
        <Command className="rounded-lg border shadow-md md:min-w-[450px]">
          <CommandInput
            autoFocus={false}
            className="text-base md:text-sm"
            placeholder={t('Find a wallet') + '...'}
          />
          <CommandList>
            <CommandEmpty>{t('No results found')}.</CommandEmpty>
            <CommandSeparator />
            {allowAll && (
              <CommandItem className="justify-between gap-1 rounded-none p-0 py-px">
                <Button
                  variant="ghost"
                  className="flex w-full justify-start"
                  onClick={() => {
                    setOpenWalletSelection(false)
                    setWallet(null)
                    if (update) update(null)
                  }}
                  disabled={false}
                >
                  <span>🔢</span> {t('All wallets')}
                </Button>
              </CommandItem>
            )}
            {wallets.map((wallet: IWallet) => (
              <CommandItem
                className="justify-between gap-1 rounded-none p-0 py-px"
                key={wallet._id}
              >
                <Button
                  variant="ghost"
                  className="flex w-full justify-start"
                  onClick={() => {
                    setOpenWalletSelection(false)
                    setWallet(wallet)
                    if (update) update(wallet)
                  }}
                  disabled={false}
                >
                  <span>{wallet.icon}</span> {wallet.name}
                </Button>
              </CommandItem>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

export default memo(WalletSelection)
