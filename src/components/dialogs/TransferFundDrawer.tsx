'use client'

import { currencies } from '@/constants/settings'
import { useAppDispatch, useAppSelector } from '@/hooks/reduxHook'
import { refetching } from '@/lib/reducers/loadReducer'
import { formatSymbol, revertAdjustedCurrency } from '@/lib/string'
import { toUTC } from '@/lib/time'
import { cn } from '@/lib/utils'
import { TransactionType } from '@/models/TransactionModel'
import { IWallet } from '@/models/WalletModel'
import { transferFundApi } from '@/requests'
import { LucideCalendar, LucideLoaderCircle } from 'lucide-react'
import moment from 'moment'
import { useTranslations } from 'next-intl'
import { memo, ReactNode, useCallback, useState } from 'react'
import { FieldValues, SubmitHandler, useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import CustomInput from '../CustomInput'
import { Button } from '../ui/button'
import { Calendar } from '../ui/calendar'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '../ui/drawer'
import WalletSelection from '../WalletSelection'

interface TransferFundDrawerProps {
  type?: TransactionType
  initFromWallet?: IWallet
  initToWallet?: IWallet
  trigger: ReactNode
  refetch?: () => void
  className?: string
}

function TransferFundDrawer({
  initFromWallet,
  initToWallet,
  trigger,
  refetch,
  className = '',
}: TransferFundDrawerProps) {
  // hooks
  const t = useTranslations('TransferFundDrawer')
  const dispatch = useAppDispatch()

  // store
  const currency = useAppSelector(state => state.settings.settings?.currency)
  const { curWallet } = useAppSelector(state => state.wallet)

  // values
  const locale = currencies.find(c => c.value === currency)?.locale || 'en-US'

  // states
  const [open, setOpen] = useState<boolean>(false)
  const [saving, setSaving] = useState<boolean>(false)

  // form
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    setValue,
    watch,
    control,
    clearErrors,
    reset,
  } = useForm<FieldValues>({
    defaultValues: {
      fromWalletId: initFromWallet?._id || '',
      toWalletId: initToWallet?._id || '',
      amount: '',
      date: moment().format('YYYY-MM-DD'),
    },
  })
  const form = watch()

  // validate form
  const handleValidate: SubmitHandler<FieldValues> = useCallback(
    data => {
      let isValid = true

      // source wallet is required
      if (!data.fromWalletId) {
        setError('fromWalletId', {
          type: 'manual',
          message: t('Source wallet is required'),
        })
        isValid = false
      }

      // destination wallet is required
      if (!data.fromWalletId) {
        setError('toWalletId', {
          type: 'manual',
          message: t('Destination wallet is required'),
        })
        isValid = false
      }

      // source wallet and destination wallet must be different
      if (data.fromWalletId === data.toWalletId) {
        setError('toWalletId', {
          type: 'manual',
          message: t('Source wallet and destination wallet must be different'),
        })
        isValid = false
      }

      // amount is required
      if (!data.amount) {
        setError('amount', {
          type: 'manual',
          message: t('Amount is required'),
        })
        isValid = false
      }

      // date must be selected
      if (!data.date) {
        setError('date', {
          type: 'manual',
          message: t('Date is required'),
        })
        isValid = false
      }

      return isValid
    },
    [setError, t]
  )

  // transfer fund
  const handleTransferFund: SubmitHandler<FieldValues> = useCallback(
    async data => {
      // validate form
      if (!handleValidate(data)) return

      // start loading
      setSaving(true)
      toast.loading(t('Transferring') + '...', { id: 'transferring' })

      try {
        const { message } = await transferFundApi({
          ...data,
          date: toUTC(data.date),
          amount: revertAdjustedCurrency(data.amount, locale),
        })

        dispatch(refetching())

        if (refetch) refetch()

        toast.success(message, { id: 'transferring' })
        setOpen(false)
        reset()
      } catch (err: any) {
        toast.error(t('Failed to transfer'), { id: 'transferring' })
        console.log(err)
      } finally {
        // stop loading
        setSaving(false)
      }
    },
    [handleValidate, reset, refetch, dispatch, locale, t]
  )

  return (
    <Drawer
      open={open}
      onOpenChange={setOpen}
    >
      <DrawerTrigger asChild>{trigger}</DrawerTrigger>

      <DrawerContent className={cn(className)}>
        <div className="mx-auto w-full max-w-sm px-21/2">
          <DrawerHeader>
            <DrawerTitle className="text-center">{t('Transfer Fund')}</DrawerTitle>
            <DrawerDescription className="text-center">
              {t('Transfer money between wallets')}
            </DrawerDescription>
          </DrawerHeader>

          <div className="flex flex-col gap-3">
            {/* MARK: From Wallet */}
            <div className="mt-1.5">
              <p
                className={cn(
                  'mb-1 text-xs font-semibold',
                  errors.fromWalletId?.message && 'text-rose-500'
                )}
              >
                {t('From Wallet')}
              </p>
              <div onFocus={() => clearErrors('fromWalletId')}>
                <WalletSelection
                  className={cn(
                    'w-full justify-normal',
                    errors.fromWalletId?.message && 'border-rose-500'
                  )}
                  update={(wallet: IWallet) => setValue('fromWalletId', wallet._id)}
                  initWallet={initFromWallet}
                />
              </div>
              {errors.fromWalletId?.message && (
                <span className="ml-1 block text-xs italic text-rose-400">
                  {errors.fromWalletId?.message?.toString()}
                </span>
              )}
            </div>

            {/* MARK: To Wallet */}
            <div className="mt-1.5">
              <p
                className={cn(
                  'mb-1 text-xs font-semibold',
                  errors.toWalletId?.message && 'text-rose-500'
                )}
              >
                {t('To Wallet')}
              </p>
              <div onFocus={() => clearErrors('toWalletId')}>
                <WalletSelection
                  className={cn(
                    'w-full justify-normal',
                    errors.toWalletId?.message && 'border-rose-500'
                  )}
                  update={(wallet: IWallet) => setValue('toWalletId', wallet._id)}
                  initWallet={initFromWallet}
                />
              </div>
              {errors.toWalletId?.message && (
                <span className="ml-1 block text-xs italic text-rose-400">
                  {errors.toWalletId?.message?.toString()}
                </span>
              )}
            </div>

            {/* MARK: Amount */}
            {currency && (
              <CustomInput
                id="amount"
                label={t('Amount')}
                disabled={saving}
                register={register}
                errors={errors}
                type="currency"
                control={control}
                onFocus={() => clearErrors('amount')}
                icon={<span>{formatSymbol(currency)}</span>}
              />
            )}

            {/* MARK: Date */}
            <div className="mt-1.5 flex flex-1 flex-col">
              <p className="mb-1 text-xs font-semibold">{t('Date')}</p>
              <div onFocus={() => clearErrors('date')}>
                <Drawer>
                  <DrawerTrigger className="w-full">
                    <button className="flex h-9 w-full items-center justify-between gap-2 rounded-md border px-21/2 text-start text-sm font-semibold">
                      {moment(form.date).format('MMM DD, YYYY')}
                      <LucideCalendar size={18} />
                    </button>
                  </DrawerTrigger>

                  <DrawerContent className="w-full overflow-hidden rounded-md p-0 outline-none">
                    <DrawerHeader>
                      <DrawerTitle className="text-center">{t('Select Date')}</DrawerTitle>
                      <DrawerDescription className="text-center">
                        {t('When did this transferring happen?')}
                      </DrawerDescription>
                    </DrawerHeader>

                    <div className="mx-auto flex w-full max-w-sm flex-col items-center px-21/2">
                      <Calendar
                        mode="single"
                        selected={form.date}
                        onSelect={date => {
                          setValue('date', date)
                          clearErrors('date')
                        }}
                        initialFocus
                      />
                    </div>

                    <div className="pt-8" />
                  </DrawerContent>
                </Drawer>
              </div>
              {errors.date?.message && (
                <span className="ml-1 mt-0.5 text-xs italic text-rose-400">
                  {errors.date?.message?.toString()}
                </span>
              )}
            </div>
          </div>

          {/* MARK: Footer */}
          <DrawerFooter className="mb-21 px-0">
            <div className="mt-3 flex items-center justify-end gap-21/2">
              <DrawerClose>
                <Button
                  variant="secondary"
                  className="h-10 rounded-md px-21/2 text-[13px] font-semibold"
                  onClick={() => {
                    setOpen(false)
                    reset()
                  }}
                >
                  {t('Cancel')}
                </Button>
              </DrawerClose>
              <Button
                disabled={saving}
                variant="default"
                className="h-10 min-w-[60px] rounded-md px-21/2 text-[13px] font-semibold"
                onClick={handleSubmit(handleTransferFund)}
              >
                {saving ? (
                  <LucideLoaderCircle
                    size={20}
                    className="animate-spin text-muted-foreground"
                  />
                ) : (
                  t('Save')
                )}
              </Button>
            </div>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  )
}

export default memo(TransferFundDrawer)
