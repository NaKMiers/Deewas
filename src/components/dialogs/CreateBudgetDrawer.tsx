'use client'

import { currencies } from '@/constants/settings'
import { useAppSelector } from '@/hooks/reduxHook'
import { formatSymbol, revertAdjustedCurrency } from '@/lib/string'
import { toUTC } from '@/lib/time'
import { cn } from '@/lib/utils'
import { createBudgetApi } from '@/requests/budgetRequests'
import { LucideLoaderCircle } from 'lucide-react'
import moment from 'moment'
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
import { IFullBudget } from '@/models/BudgetModel'

interface CreateBudgetDrawerProps {
  trigger: ReactNode
  update?: (budget: IFullBudget) => void
  className?: string
}

function CreateBudgetDrawer({ trigger, update, className = '' }: CreateBudgetDrawerProps) {
  // store
  const currency = useAppSelector(state => state.settings.settings?.currency)

  // values
  const locale = currencies.find(c => c.value === currency)?.locale || 'en-US'

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
      categoryId: '',
      total: '',
      begin: moment().startOf('month').toDate(),
      end: moment().endOf('month').toDate(),
    },
  })

  const [open, setOpen] = useState<boolean>(false)
  const [saving, setSaving] = useState<boolean>(false)
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: moment().startOf('month').toDate(),
    to: moment().endOf('month').toDate(),
  })

  // validate form
  const handleValidate: SubmitHandler<FieldValues> = useCallback(
    data => {
      let isValid = true

      // total is required
      if (!data.total) {
        setError('total', {
          type: 'manual',
          message: 'Amount is required',
        })
        isValid = false
      }

      // total must be > 0
      if (data.total <= 0) {
        setError('total', {
          type: 'manual',
          message: 'Amount must be greater than 0',
        })
        isValid = false
      }

      // category must be selected
      if (!data.categoryId) {
        setError('categoryId', {
          type: 'manual',
          message: 'Category is required',
        })
        isValid = false
      }

      // begin must be selected
      if (!data.begin) {
        setError('begin', {
          type: 'manual',
          message: 'From and To date is required',
        })
        isValid = false
      }

      // to must be selected
      if (!data.end) {
        setError('end', {
          type: 'manual',
          message: 'From and To date is required',
        })
        isValid = false
      }

      return isValid
    },
    [setError]
  )

  // create transaction
  const handleCreateBudget: SubmitHandler<FieldValues> = useCallback(
    async data => {
      // validate form
      if (!handleValidate(data)) return

      // start loading
      setSaving(true)
      toast.loading('Creating transaction...', { id: 'create-transaction' })

      try {
        const { budget, message } = await createBudgetApi({
          ...data,
          begin: toUTC(data.begin),
          end: toUTC(data.end),
          total: revertAdjustedCurrency(data.total, locale),
        })

        if (update) update(budget)

        toast.success(message, { id: 'create-transaction' })
        setOpen(false)
        reset()
      } catch (err: any) {
        toast.error('Failed to create transaction', { id: 'create-transaction' })
        console.log(err)
      } finally {
        // stop loading
        setSaving(false)
      }
    },
    [handleValidate, reset, update, locale]
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
            <DrawerTitle className="text-center">Create Budget</DrawerTitle>
            <DrawerDescription className="text-center">
              Budget helps you manage money wisely
            </DrawerDescription>
          </DrawerHeader>

          <div className="flex flex-col gap-3">
            {currency && (
              <CustomInput
                id="total"
                label="Total"
                disabled={saving}
                register={register}
                errors={errors}
                onFocus={() => clearErrors('total')}
                type="currency"
                control={control}
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
                Category
              </p>
              <div onFocus={() => clearErrors('categoryId')}>
                <CategoryPicker
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
                From - To
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
                  Cancel
                </Button>
              </DrawerClose>
              <Button
                disabled={saving}
                variant="default"
                className="h-10 min-w-[60px] rounded-md px-21/2 text-[13px] font-semibold"
                onClick={handleSubmit(handleCreateBudget)}
              >
                {saving ? (
                  <LucideLoaderCircle
                    size={20}
                    className="animate-spin text-muted-foreground"
                  />
                ) : (
                  'Save'
                )}
              </Button>
            </div>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  )
}

export default memo(CreateBudgetDrawer)
