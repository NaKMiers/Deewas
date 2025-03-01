'use client'

import { useAppSelector } from '@/hooks/reduxHook'
import { checkTranType, formatSymbol } from '@/lib/string'
import { toUTC } from '@/lib/time'
import { cn } from '@/lib/utils'
import { IFullTransaction } from '@/models/TransactionModel'
import { updateTransactionApi } from '@/requests/transactionRequests'
import { LucideCalendar, LucideLoaderCircle } from 'lucide-react'
import moment from 'moment'
import { ReactNode, useCallback, useState } from 'react'
import { FieldValues, SubmitHandler, useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import CategoryPicker from '../CategoryPicker'
import CustomInput from '../CustomInput'
import { Button } from '../ui/button'
import { Calendar } from '../ui/calendar'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover'

interface UpdateTransactionDialogProps {
  transaction: IFullTransaction
  trigger: ReactNode
  refetch?: () => void
  className?: string
}

function UpdateTransactionDialog({
  transaction,
  trigger,
  refetch,
  className = '',
}: UpdateTransactionDialogProps) {
  // store
  const {
    settings: { currency },
  } = useAppSelector(state => state.settings)

  // form
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    setValue,
    watch,
    clearErrors,
    reset,
  } = useForm<FieldValues>({
    defaultValues: {
      walletId: transaction.wallet._id || '',
      name: transaction.name || '',
      categoryId: transaction.category._id || '',
      amount: transaction.amount.toFixed(2) || '',
      date: moment().format('YYYY-MM-DD'),
    },
  })

  const form = watch()
  const [open, setOpen] = useState<boolean>(false)
  const [saving, setSaving] = useState<boolean>(false)

  // validate form
  const handleValidate: SubmitHandler<FieldValues> = useCallback(
    data => {
      let isValid = true

      // name is required
      if (!data.name) {
        setError('name', {
          type: 'manual',
          message: 'Name is required',
        })
        isValid = false
      }

      // amount is required
      if (!data.amount) {
        setError('amount', {
          type: 'manual',
          message: 'Amount is required',
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

      // date must be selected
      if (!data.date) {
        setError('date', {
          type: 'manual',
          message: 'Date is required',
        })
        isValid = false
      }

      return isValid
    },
    [setError]
  )

  // update transaction
  const handleUpdateTransaction: SubmitHandler<FieldValues> = useCallback(
    async data => {
      // validate form
      if (!handleValidate(data)) return

      // start loading
      setSaving(true)
      toast.loading('Updating transaction...', { id: 'update-transaction' })

      console.log('data', {
        ...data,
        date: toUTC(data.date),
        amount: data.amount,
      })

      try {
        const { message } = await updateTransactionApi(transaction._id, {
          ...data,
          date: toUTC(data.date),
          amount: data.amount,
        })

        if (refetch) refetch()

        toast.success(message, { id: 'update-transaction' })
        setOpen(false)
        reset()
      } catch (err: any) {
        toast.error('Failed to update transaction', { id: 'update-transaction' })
        console.log(err)
      } finally {
        // stop loading
        setSaving(false)
      }
    },
    [handleValidate, reset, refetch, transaction._id]
  )

  return (
    <Dialog
      open={open}
      onOpenChange={setOpen}
    >
      <DialogTrigger asChild>{trigger}</DialogTrigger>

      <DialogContent className={cn('rounded-lg border-slate-200/30 sm:max-w-[425px]', className)}>
        <DialogHeader className="text-start">
          <DialogTitle className="font-semibold">
            Update{' '}
            {transaction.type && (
              <span className={cn(checkTranType(transaction.type).color)}>{transaction.type}</span>
            )}{' '}
            transaction
          </DialogTitle>
          <DialogDescription>Transactions keep track of your finances effectively.</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3">
          <CustomInput
            id="name"
            label="Name"
            disabled={saving}
            register={register}
            errors={errors}
            type="text"
            onFocus={() => clearErrors('name')}
          />

          <CustomInput
            id="amount"
            label="Amount"
            disabled={saving}
            register={register}
            errors={errors}
            type="number"
            onFocus={() => clearErrors('amount')}
            icon={<span>{formatSymbol(currency)}</span>}
          />

          {/* Category */}
          <div className="mt-1.5 flex flex-1 flex-col">
            <p
              className={cn('mb-1 text-xs font-semibold', errors.categoryId?.message && 'text-rose-500')}
            >
              Category
            </p>
            <div onFocus={() => clearErrors('category')}>
              <CategoryPicker
                category={transaction.category}
                onChange={(categoryId: string) => setValue('categoryId', categoryId)}
                type={transaction.type}
              />
            </div>
            {errors.category?.message && (
              <span className="ml-1 mt-0.5 text-xs italic text-rose-400">
                {errors.categoryId?.message?.toString()}
              </span>
            )}
          </div>

          {/* Transaction */}
          <div className="mt-1.5 flex flex-1 flex-col">
            <p className="mb-1 text-xs font-semibold">Date</p>
            <div onFocus={() => clearErrors('date')}>
              <Popover>
                <PopoverTrigger className="w-full">
                  <button className="flex h-9 w-full items-center justify-between gap-2 rounded-md border px-21/2 text-start text-sm font-semibold">
                    {moment(form.date).format('MMM DD, YYYY')}
                    <LucideCalendar size={18} />
                  </button>
                </PopoverTrigger>

                <PopoverContent className="w-full overflow-hidden rounded-md p-0 outline-none">
                  <Calendar
                    mode="single"
                    selected={form.date}
                    onSelect={date => {
                      setValue('date', date)
                      clearErrors('date')
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            {errors.date?.message && (
              <span className="ml-1 mt-0.5 text-xs italic text-rose-400">
                {errors.date?.message?.toString()}
              </span>
            )}
          </div>
        </div>

        <DialogFooter>
          <div className="mt-3 flex items-center justify-end gap-21/2">
            <DialogClose>
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
            </DialogClose>
            <Button
              disabled={saving}
              variant="default"
              className="h-10 min-w-[60px] rounded-md px-21/2 text-[13px] font-semibold"
              onClick={handleSubmit(handleUpdateTransaction)}
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
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default UpdateTransactionDialog
function refresh() {
  throw new Error('Function not implemented.')
}
