'use client'

import { checkTranType } from '@/lib/string'
import { toUTC } from '@/lib/time'
import { cn } from '@/lib/utils'
import { createTransactionApi } from '@/requests/transactionRequests'
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
import { useAppSelector } from '@/hooks/reduxHook'

interface CreateTransactionDialogProps {
  trigger: ReactNode
  className?: string
}

function CreateTransactionDialog({ trigger, className = '' }: CreateTransactionDialogProps) {
  // store
  const curWallet: any = useAppSelector(state => state.wallet.curWallet)

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
      walletId: curWallet?._id,
      name: '',
      categoryId: '',
      amount: '',
      date: moment().format('YYYY-MM-DD'),
      type: '',
    },
  })

  const form = watch()
  const [open, setOpen] = useState<boolean>(false)
  const [saving, setSaving] = useState<boolean>(false)

  // const { userSettings, exchangeRate } = useAppSelector(state => state.settings)
  const userSettings = { currency: 'USD' }
  const exchangeRate = 1

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

      // type is required
      if (!data.type) {
        setError('type', {
          type: 'manual',
          message: 'Type is required',
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

  // create transaction
  const handleCreateTransaction: SubmitHandler<FieldValues> = useCallback(
    async data => {
      if (!curWallet?._id) {
        return toast.error('Please select a wallet to continue')
      }

      // validate form
      if (!handleValidate(data)) return

      // start loading
      setSaving(true)
      toast.loading('Creating transaction...', { id: 'create-transaction' })

      console.log('data', {
        ...data,
        walletId: curWallet._id,
        date: toUTC(data.date),
        amount: data.amount / exchangeRate,
      })

      try {
        const { transaction, message } = await createTransactionApi({
          ...data,
          walletId: curWallet._id,
          date: toUTC(data.date),
          amount: data.amount / exchangeRate,
        })

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
    [handleValidate, reset, curWallet?._id]
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
            Create {form.type && <span className={cn(checkTranType(form.type).color)}>{form.type}</span>}{' '}
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
          />

          <CustomInput
            id="type"
            label="Type"
            disabled={saving}
            register={register}
            errors={errors}
            type="select"
            control={control}
            options={[
              {
                label: 'Expense',
                value: 'expense',
              },
              {
                label: 'Income',
                value: 'income',
              },
              {
                label: 'Saving',
                value: 'saving',
              },
              {
                label: 'Invest',
                value: 'invest',
              },
            ]}
            onFocus={() => clearErrors('type')}
          />

          <div className="flex flex-wrap gap-4">
            {/* Category */}
            <div className="flex flex-1 flex-col">
              <p className="mb-1 text-xs font-semibold">Category</p>
              <div onFocus={() => clearErrors('category')}>
                <CategoryPicker
                  onChange={(categoryId: string) => setValue('categoryId', categoryId)}
                  type={form.type}
                />
              </div>
              {errors.category?.message && (
                <span className="ml-1 mt-0.5 text-xs italic text-rose-400">
                  {errors.category?.message?.toString()}
                </span>
              )}
            </div>

            {/* Transaction */}
            <div className="flex flex-1 flex-col">
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
              onClick={handleSubmit(handleCreateTransaction)}
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

export default CreateTransactionDialog
function refresh() {
  throw new Error('Function not implemented.')
}
