'use client'

import { useAppDispatch, useAppSelector } from '@/hooks/reduxHook'
import { deleteWallet, updateWallet } from '@/lib/reducers/walletReducer'
import { cn } from '@/lib/utils'
import { IWallet } from '@/models/WalletModel'
import { deleteWalletApi } from '@/requests'
import { LucidePencil, LucidePlusSquare, LucideTrash, LucideX } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { memo, useCallback, useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { LuChevronsUpDown, LuLoaderCircle } from 'react-icons/lu'
import ConfirmDialog from './dialogs/ConfirmDialog'
import CreateWalletDrawer from './dialogs/CreateWalletDrawer'
import UpdateWalletDrawer from './dialogs/UpdateWalletDrawer'
import { Button } from './ui/button'
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from './ui/command'
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from './ui/drawer'
import { Separator } from './ui/separator'
import { Skeleton } from './ui/skeleton'
import { refresh } from '@/lib/reducers/loadReducer'

interface WalletPickerProps {
  wallet?: IWallet
  onChange: (wallet: IWallet | null) => void
  isAllowedAll?: boolean
  className?: string
}

function WalletPicker({ wallet, isAllowedAll, onChange, className }: WalletPickerProps) {
  // hooks
  const t = useTranslations('walletPicker')
  const dispatch = useAppDispatch()

  // store
  const { wallets, loading } = useAppSelector(state => state.wallet)

  // states
  const [open, setOpen] = useState<boolean>(false)
  const [selectedWallet, setSelectedWallet] = useState<IWallet | null>(wallet || null)

  const [deleting, setDeleting] = useState<string>('')

  // auto select wallet when wallet is passed
  useEffect(() => {
    if (wallet) setSelectedWallet(wallet)
  }, [wallet])

  // delete wallet
  const handleDeleteWallet = useCallback(
    async (id: string) => {
      // start deleting
      setDeleting(id)
      toast.loading(t('Deleting wallet') + '...', { id: 'delete-wallet' })

      try {
        const { wallet: w, message } = await deleteWalletApi(id)

        toast.success(message, { id: 'delete-wallet' })

        dispatch(wallets.length > 1 ? deleteWallet(w) : updateWallet(w))
        dispatch(refresh())
      } catch (err: any) {
        toast.error(err.message, { id: 'delete-wallet' })
        console.log(err)
      } finally {
        // stop deleting
        setDeleting('')
      }
    },
    [dispatch, wallets, , t]
  )

  return (
    <div className={`relative shadow-md ${className}`}>
      <Drawer
        open={open}
        onOpenChange={setOpen}
      >
        <DrawerTrigger asChild>
          {!loading ? (
            <Button className="w-full justify-between">
              {selectedWallet ? (
                <p>
                  <span>{selectedWallet.icon}</span> {selectedWallet.name}
                </p>
              ) : isAllowedAll ? (
                <p>
                  <span>+</span> {t('All wallets')}
                </p>
              ) : (
                t('Select wallet')
              )}
              <LuChevronsUpDown size={18} />
            </Button>
          ) : (
            <Skeleton className="h-9 rounded-md" />
          )}
        </DrawerTrigger>
        <DrawerContent className="w-full p-0 shadow-md">
          <div className="mx-auto w-full max-w-sm px-21/2">
            <DrawerHeader>
              <DrawerTitle className="text-center">{t('Select wallet')}</DrawerTitle>
              <DrawerDescription className="text-center">
                {t('Wallets are used to group your transactions by source of funds')}
              </DrawerDescription>
            </DrawerHeader>

            {/* Search Bar */}
            <Command className="rounded-lg border shadow-md">
              <CommandInput
                autoFocus={false}
                className="text-base md:text-sm"
                placeholder={t('Find a wallet') + '...'}
              />

              {/* MARK: Create Wallet */}
              <CreateWalletDrawer
                trigger={
                  <Button
                    variant="ghost"
                    className="mb-0.5 flex w-full justify-start gap-2 rounded-none text-left text-sm"
                  >
                    <LucidePlusSquare size={18} />
                    {t('Create Wallet')}
                  </Button>
                }
              />
              <CommandList>
                <CommandEmpty>{t('No results found')}.</CommandEmpty>
                <CommandSeparator />
                {isAllowedAll && (
                  <CommandItem className="justify-between gap-1 rounded-none p-0 py-px">
                    <Button
                      variant="ghost"
                      className={cn('w-full justify-start rounded-none border-l-[3px]')}
                      onClick={() => {
                        setOpen(false)
                        setSelectedWallet(null)
                        onChange(null)
                      }}
                      disabled={false}
                    >
                      <span>+</span> All wallets
                    </Button>
                  </CommandItem>
                )}

                {wallets.map(wallet => (
                  <CommandItem
                    className="justify-between gap-1 rounded-none p-0 pr-21/2"
                    key={wallet._id}
                  >
                    <Button
                      variant="ghost"
                      className={cn('w-full justify-start rounded-none border-l-[3px]')}
                      onClick={() => {
                        setOpen(false)
                        setSelectedWallet(wallet)
                        onChange(wallet)
                      }}
                      disabled={false}
                    >
                      <span>{wallet.icon}</span> {wallet.name}
                    </Button>

                    {/* MARK: Update Wallet */}
                    <UpdateWalletDrawer
                      wallet={wallet}
                      trigger={
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 p-1.5 hover:bg-transparent"
                        >
                          <LucidePencil />
                        </Button>
                      }
                    />

                    {/* MARK: Delete Wallet */}
                    <ConfirmDialog
                      label={t('Delete wallet')}
                      desc={
                        wallets.length > 1
                          ? `${t('All transactions of this wallet will be deleted')}. ${t('Are you sure you want to delete this wallet?')}`
                          : `${t('Since this is the only wallet, instead of deleting this wallet we will clear all your data and associated transactions, your categories will be safe')}. ${t('Are you sure you want to do this?')}`
                      }
                      confirmLabel={t('Delete')}
                      cancelLabel={t('Cancel')}
                      onConfirm={() => handleDeleteWallet(wallet._id)}
                      disabled={deleting === wallet._id}
                      className="!h-auto !w-auto"
                      trigger={
                        <Button
                          disabled={deleting === wallet._id}
                          variant="ghost"
                          className="0 h-7 p-1.5 hover:bg-transparent"
                        >
                          {deleting === wallet._id ? (
                            <LuLoaderCircle
                              size={16}
                              className="animate-spin text-slate-400"
                            />
                          ) : (
                            <LucideTrash size={16} />
                          )}
                        </Button>
                      }
                    />
                  </CommandItem>
                ))}
              </CommandList>
            </Command>

            <Separator className="my-8" />
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  )
}

export default memo(WalletPicker)
