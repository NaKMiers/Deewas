'use client'

import { useAppDispatch, useAppSelector } from '@/hooks/reduxHook'
import { refresh } from '@/lib/reducers/loadReducer'
import { formatSymbol } from '@/lib/string'
import { toUTC } from '@/lib/time'
import { cn } from '@/lib/utils'
import { IFullBudget } from '@/models/BudgetModel'
import { updateBudgetApi } from '@/requests/budgetRequests'
import { LucideLoaderCircle } from 'lucide-react'
import moment from 'moment'
import { useTranslations } from 'next-intl'
import { memo, ReactNode, useCallback, useState } from 'react'
import { FieldValues, SubmitHandler, useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import CategoryPicker from '../CategoryPicker'
import CustomInput from '../CustomInput'
import { Button } from '../ui/button'
import { DateRangePicker } from '../ui/DateRangePicker'
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

interface UpdateBudgetDrawerProps {
  budget: IFullBudget
  trigger: ReactNode
  className?: string
}

function UpdateBudgetDrawer({ budget, trigger, className }: UpdateBudgetDrawerProps) {
  // hooks
  const t = useTranslations('updateBudgetDrawer')
  const dispatch = useAppDispatch()

  // store
  const currency = useAppSelector(state => state.settings.settings?.currency)

  // form
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    setValue,
    control,
    clearErrors,
    reset,
  } = useForm<FieldValues>({
    defaultValues: {
      categoryId: budget.category._id || '',
      total: budget.total.toString() || '',
      begin: moment(budget.begin).toDate(),
      end: moment(budget.end).toDate(),
    },
  })

  const [open, setOpen] = useState<boolean>(false)
  const [saving, setSaving] = useState<boolean>(false)
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: moment(budget.begin).startOf('month').toDate(),
    to: moment(budget.end).endOf('month').toDate(),
  })

  // validate form
  const handleValidate: SubmitHandler<FieldValues> = useCallback(
    data => {
      let isValid = true

      // total is required
      if (!data.total) {
        setError('total', {
          type: 'manual',
          message: t('Amount is required'),
        })
        isValid = false
      }

      // total must be > 0
      if (data.total <= 0) {
        setError('total', {
          type: 'manual',
          message: t('Amount must be greater than 0'),
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

      // begin must be selected
      if (!data.begin) {
        setError('begin', {
          type: 'manual',
          message: t('From and To date is required'),
        })
        isValid = false
      }

      // to must be selected
      if (!data.end) {
        setError('end', {
          type: 'manual',
          message: t('From and To date is required'),
        })
        isValid = false
      }

      return isValid
    },
    [setError, t]
  )

  // update transaction
  const handleUpdateBudget: SubmitHandler<FieldValues> = useCallback(
    async data => {
      // validate form
      if (!handleValidate(data)) return

      // start loading
      setSaving(true)
      toast.loading(t('Updating budget') + '...', { id: 'update-budget' })

      try {
        const { message } = await updateBudgetApi(budget._id, {
          ...data,
          begin: toUTC(moment(data.begin).startOf('day').toDate()),
          end: toUTC(moment(data.end).endOf('day').toDate()),
          total: data.total,
        })

        toast.success(message, { id: 'update-budget' })
        setOpen(false)
        reset()
        dispatch(refresh())
      } catch (err: any) {
        toast.error(t('Failed to update budget'), { id: 'update-budget' })
        console.log(err)
      } finally {
        // stop loading
        setSaving(false)
      }
    },
    [dispatch, handleValidate, reset, budget._id, t]
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
            <DrawerTitle className="text-center">{t('Update Budget')}</DrawerTitle>
            <DrawerDescription className="text-center">
              {t('Budget helps you manage money wisely')}
            </DrawerDescription>
          </DrawerHeader>

          <div className="flex flex-col gap-3">
            {currency && (
              <CustomInput
                id="total"
                label={t('Total')}
                disabled={saving}
                register={register}
                errors={errors}
                type="currency"
                control={control}
                onFocus={() => clearErrors('total')}
                icon={<span>{formatSymbol(currency)}</span>}
              />
            )}

            {/* Category */}
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
                  category={budget.category}
                  onChange={(categoryId: string) => setValue('categoryId', categoryId)}
                  type="expense"
                />
              </div>
              {errors.categoryId?.message && (
                <span className="ml-1 mt-0.5 text-xs italic text-rose-400">
                  {errors.categoryId?.message?.toString()}
                </span>
              )}
            </div>

            {/* Budget */}
            <div className="mt-1.5 flex flex-1 flex-col">
              <p
                className={cn(
                  'mb-1 text-xs font-semibold',
                  (errors.begin || errors.end)?.message && 'text-rose-500'
                )}
              >
                {t('From - To')}
              </p>
              <div
                onFocus={() => {
                  clearErrors('begin')
                  clearErrors('end')
                }}
              >
                <DateRangePicker
                  initialDateFrom={dateRange.from}
                  initialDateTo={dateRange.to}
                  showCompare={false}
                  onUpdate={values => {
                    const { from, to } = values.range

                    if (!from || !to) return

                    setDateRange({ from, to })
                    setValue('begin', from)
                    setValue('end', to)
                  }}
                  className="h-9 w-full"
                />
              </div>
              {(errors.begin || errors.end)?.message && (
                <span className="ml-1 mt-0.5 text-xs italic text-rose-400">
                  {(errors.begin || errors.end)?.message?.toString()}
                </span>
              )}
            </div>
          </div>

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
                onClick={handleSubmit(handleUpdateBudget)}
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

export default memo(UpdateBudgetDrawer)
