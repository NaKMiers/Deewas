'use client'

import { useAppDispatch, useAppSelector } from '@/hooks/reduxHook'
import { refresh } from '@/lib/reducers/loadReducer'
import { checkTranType, formatSymbol } from '@/lib/string'
import { toUTC } from '@/lib/time'
import { cn } from '@/lib/utils'
import { ICategory } from '@/models/CategoryModel'
import { TransactionType } from '@/models/TransactionModel'
import { IWallet } from '@/models/WalletModel'
import { createTransactionApi } from '@/requests'
import { LucideCalendar, LucideLoaderCircle } from 'lucide-react'
import moment from 'moment'
import { useTranslations } from 'next-intl'
import { memo, ReactNode, useCallback, useEffect, useState } from 'react'
import { FieldValues, SubmitHandler, useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import CategoryPicker from '../CategoryPicker'
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
import WalletPicker from '../WalletPicker'

interface CreateTransactionDrawerProps {
  type?: TransactionType
  initWallet?: IWallet
  initCategory?: ICategory
  initDate?: string
  trigger: ReactNode
  className?: string
}

function CreateTransactionDrawer({
  type,
  initWallet,
  initCategory,
  initDate,
  trigger,
  className,
}: CreateTransactionDrawerProps) {
  // hooks
  const t = useTranslations('createTransactionDrawer')
  const dispatch = useAppDispatch()

  // store
  const currency = useAppSelector(state => state.settings.settings?.currency)

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
    getValues,
    control,
    clearErrors,
    reset,
  } = useForm<FieldValues>({
    defaultValues: {
      walletId: initWallet?._id || '',
      name: '',
      categoryId: initCategory?._id || '',
      amount: '',
      date: initDate ? moment(initDate).format('YYYY-MM-DD') : moment().format('YYYY-MM-DD'),
      type: initCategory?.type || type || 'expense',
    },
  })
  const form = watch()

  useEffect(() => {
    if (!getValues('walletId')) {
      setValue('walletId', initWallet?._id)
    }
  }, [getValues, setValue, initWallet])

  // validate form
  const handleValidate: SubmitHandler<FieldValues> = useCallback(
    data => {
      let isValid = true

      // wallet is required
      if (!data.walletId) {
        setError('walletId', {
          type: 'manual',
          message: t('Wallet is required'),
        })
        isValid = false
      }

      // name is required
      if (!data.name) {
        setError('name', {
          type: 'manual',
          message: t('Name is required'),
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

      // type is required
      if (!data.type) {
        setError('type', {
          type: 'manual',
          message: t('Type is required'),
        })
        isValid = false
      }

      // category must be selected
      if (!data.categoryId) {
        setError('categoryId', {
          type: 'manual',
          message: t('Category is required'),
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

  // create transaction
  const handleCreateTransaction: SubmitHandler<FieldValues> = useCallback(
    async data => {
      // validate form
      if (!handleValidate(data)) return

      // start loading
      setSaving(true)
      toast.loading(t('Creating transaction') + '...', { id: 'create-transaction' })

      try {
        const { transaction, message } = await createTransactionApi({
          ...data,
          date: toUTC(data.date),
          amount: data.amount,
        })

        toast.success(message, { id: 'create-transaction' })
        setOpen(false)
        reset()
        dispatch(refresh())
      } catch (err: any) {
        toast.error(t('Failed to create transaction'), { id: 'create-transaction' })
        console.log(err)
      } finally {
        // stop loading
        setSaving(false)
      }
    },
    [handleValidate, reset, , dispatch, t]
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
            <DrawerTitle className="text-center">
              {t('Create')}{' '}
              {form.type && <span className={cn(checkTranType(form.type).color)}>{t(form.type)}</span>}{' '}
              {t('transaction')}
            </DrawerTitle>
            <DrawerDescription className="text-center">
              {t('Transactions keep track of your finances effectively')}
            </DrawerDescription>
          </DrawerHeader>

          <div className="flex flex-col gap-3">
            {/* MARK: Name */}
            <CustomInput
              id="name"
              label={t('Name')}
              disabled={saving}
              register={register}
              errors={errors}
              type="text"
              onFocus={() => clearErrors('name')}
            />

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

            {/* MARK: Type */}
            {!initCategory && !type && (
              <CustomInput
                id="type"
                label={t('Type')}
                disabled={saving}
                register={register}
                errors={errors}
                type="select"
                control={control}
                options={[
                  {
                    label: t('Expense'),
                    value: 'expense',
                  },
                  {
                    label: t('Income'),
                    value: 'income',
                  },
                  {
                    label: t('Saving'),
                    value: 'saving',
                  },
                  {
                    label: t('Invest'),
                    value: 'invest',
                  },
                ]}
                onFocus={() => clearErrors('type')}
              />
            )}

            {/* MARK: Category */}
            <div className="mt-1.5 flex flex-1 flex-col">
              <p
                className={cn(
                  'mb-1 text-xs font-semibold',
                  errors.categoryId?.message && 'text-rose-500'
                )}
              >
                {t('Category')}
              </p>
              <div onFocus={() => clearErrors('categoryId')}>
                <CategoryPicker
                  category={initCategory}
                  onChange={(categoryId: string) => setValue('categoryId', categoryId)}
                  type={form.type}
                />
              </div>
              {errors.categoryId?.message && (
                <span className="ml-1 mt-0.5 text-xs italic text-rose-400">
                  {errors.categoryId?.message?.toString()}
                </span>
              )}
            </div>

            {/* MARK: Wallet */}
            <div className="mt-1.5">
              <p
                className={cn('mb-1 text-xs font-semibold', errors.walletId?.message && 'text-rose-500')}
              >
                {t('Wallet')}
              </p>
              <div onFocus={() => clearErrors('walletId')}>
                <WalletPicker
                  className={cn('w-full justify-normal', errors.walletId?.message && 'border-rose-500')}
                  wallet={initWallet}
                  onChange={(wallet: IWallet | null) => wallet && setValue('walletId', wallet._id)}
                />
              </div>
              {errors.walletId?.message && (
                <span className="ml-1 mt-0.5 block text-xs italic text-rose-400">
                  {errors.walletId?.message?.toString()}
                </span>
              )}
            </div>

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
                        {t('When did this transaction happen?')}
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
                onClick={handleSubmit(handleCreateTransaction)}
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

export default memo(CreateTransactionDrawer)
