'use client'

import BudgetTab from '@/components/BudgetTab'
import CustomInput from '@/components/CustomInput'
import LoadingButton from '@/components/LoadingButton'
import MonthYearPicker from '@/components/MonthYearPicker'
import Transaction from '@/components/Transaction'
import { Button } from '@/components/ui/button'
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import WalletCard from '@/components/WalletCard'
import { useAppDispatch } from '@/hooks/reduxHook'
import useSettings from '@/hooks/useSettings'
import { setPageLoading } from '@/lib/reducers/loadReducer'
import { formatCompactNumber, getLocale } from '@/lib/string'
import { formatTimeRange } from '@/lib/time'
import { cn } from '@/lib/utils'
import { IFullBudget } from '@/models/BudgetModel'
import { ISettings } from '@/models/SettingsModel'
import { IFullTransaction } from '@/models/TransactionModel'
import { IUser } from '@/models/UserModel'
import { IWallet } from '@/models/WalletModel'
import { editUserApi, getUserApi } from '@/requests'
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  format,
  isSameDay,
  isSameMonth,
  startOfMonth,
  subMonths,
} from 'date-fns'
import { motion } from 'framer-motion'
import { LucideChevronLeft, LucideChevronRight } from 'lucide-react'
import { useLocale } from 'next-intl'
import Image from 'next/image'
import { useParams, useRouter } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'
import { FieldValues, SubmitHandler, useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { FaUser } from 'react-icons/fa'
import { GoSingleSelect } from 'react-icons/go'
import { IoText } from 'react-icons/io5'
import { MdEmail } from 'react-icons/md'

function EditUserPage() {
  // hooks
  const dispatch = useAppDispatch()
  const router = useRouter()
  const { id } = useParams<{ id: string }>()
  const locale = useLocale()
  useSettings()

  // states
  const [user, setUser] = useState<IUser | null>(null)
  const [wallets, setWallets] = useState<IWallet[]>([])
  const [groups, setGroups] = useState<any[]>([])
  const [transactions, setTransactions] = useState<IFullTransaction[]>([])
  const [settings, setSettings] = useState<ISettings | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(new Date())

  // Get all days in the current month
  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd })

  // form
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    setValue,
    control,
    reset,
    clearErrors,
  } = useForm<FieldValues>({
    defaultValues: {
      username: '',
      email: '',
      authType: '',
      name: '',
    },
  })

  // get user to edit
  useEffect(() => {
    const getUser = async () => {
      if (!id) return

      // star page loading
      dispatch(setPageLoading(true))

      try {
        const { user, wallets, transactions, budgets, settings } = await getUserApi(id)

        // set user to state
        setUser(user)
        setWallets(wallets)
        setTransactions(transactions)
        setSettings(settings)

        const groups: {
          [key: string]: {
            begin: string
            end: string
            budgets: IFullBudget[]
          }
        } = {}

        budgets.forEach((budget: IFullBudget) => {
          const key = `${budget.begin}-${budget.end}`
          console.log(key)

          if (!groups[key]) {
            groups[key] = {
              begin: budget.begin,
              end: budget.end,
              budgets: [],
            }
          }

          groups[key].budgets.push(budget)
        })

        setGroups(Object.entries(groups))

        reset(user)
      } catch (err: any) {
        console.log(err)
        toast.error(err.message)
      } finally {
        // stop page loading
        dispatch(setPageLoading(false))
      }
    }

    getUser()
  }, [dispatch, reset, id])

  // Get transactions for a specific date
  const getTransactionsForDate = (date: Date) => {
    return transactions.filter(tx => isSameDay(new Date(tx.date), date))
  }

  // Get total amount for a specific date
  const getTotalForDate = (date: Date) => {
    const dateTransactions = getTransactionsForDate(date)
    return dateTransactions.reduce((total, tx) => {
      return tx.type === 'expense' ? total - tx.amount : total + tx.amount
    }, 0)
  }

  // validate form
  const handleValidate: SubmitHandler<FieldValues> = useCallback(
    data => {
      let isValid = true

      // check if user is not found
      if (!user) {
        toast.error('User not found')
        return false
      }

      // only update if there is any change
      let countChanges: number = 0

      if (data.username !== user.username) countChanges++
      if (data.email !== user.email) countChanges++
      if (data.authType !== user.authType) countChanges++
      if (data.name !== user.name) countChanges++

      if (countChanges === 0) {
        toast.error('No changes to update')
        return false
      }

      return isValid
    },
    [user]
  )

  // MARK: Submit
  // send request to server to edit account
  const onSubmit: SubmitHandler<FieldValues> = async data => {
    // validate form
    if (!handleValidate(data)) return

    // start loading
    setLoading(true)

    try {
      const { message } = await editUserApi(id, data)

      // show success message
      toast.success(message)

      // reset form
      reset()
      dispatch(setPageLoading(false))

      // redirect back
      router.back()
    } catch (err: any) {
      console.log(err)
      toast.error(err.message)
    } finally {
      // stop loading
      setLoading(false)
    }
  }

  return (
    <div className="w-full flex-1 p-21">
      <div className="flex flex-col items-start gap-21 md:flex-row">
        <div className="relative mt-4 flex-shrink-0">
          <div className="aspect-square w-full max-w-[100px] overflow-hidden rounded-lg shadow-lg">
            <Image
              src={user?.avatar || process.env.NEXT_PUBLIC_DEFAULT_AVATAR!}
              height={200}
              width={200}
              alt="avatar"
              className="h-full w-full object-cover"
            />
          </div>

          {user?.role && (
            <div className="absolute -top-2 left-1/2 z-30 -translate-x-1/2 rounded-md bg-secondary px-1.5 py-[2px] font-body text-xs text-yellow-300 shadow-md">
              {user.role}
            </div>
          )}
        </div>

        <div className="flex w-full flex-col gap-2">
          <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
            <CustomInput
              id="name"
              label="Name"
              disabled={loading}
              register={register}
              errors={errors}
              required
              type="text"
              icon={<IoText size={20} />}
              onFocus={() => clearErrors('name')}
            />
            <CustomInput
              id="authType"
              label="Auth Type"
              disabled={loading}
              register={register}
              errors={errors}
              required
              type="select"
              control={control}
              options={[
                { value: 'local', label: 'Local' },
                { value: 'google', label: 'Google' },
                { value: 'apple', label: 'Apple' },
              ]}
              icon={<GoSingleSelect size={20} />}
              onFocus={() => clearErrors('authType')}
            />
          </div>

          <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
            <CustomInput
              id="username"
              label="Username"
              disabled={loading}
              register={register}
              errors={errors}
              required={!!user?.username}
              type="text"
              icon={<FaUser size={20} />}
              onFocus={() => clearErrors('username')}
            />
            <CustomInput
              id="email"
              label="Email"
              disabled={loading}
              register={register}
              errors={errors}
              required
              type="email"
              icon={<MdEmail size={20} />}
              onFocus={() => clearErrors('email')}
            />
          </div>
        </div>
      </div>

      {/* Save Button */}
      <LoadingButton
        className="mt-6 px-4 py-2"
        onClick={handleSubmit(onSubmit)}
        text="Save"
        isLoading={loading}
      />

      {/* Wallets */}
      <div className="mt-21 grid grid-cols-1">
        <Carousel className="w-full">
          <CarouselContent
            className={cn(
              wallets.length > 1 && 'pr-10 sm:pr-0 lg:pr-0',
              wallets.length > 2 && 'pr-10 sm:pr-10 lg:pr-0',
              wallets.length > 3 && 'pr-10 sm:pr-10 lg:pr-10'
            )}
          >
            {wallets.map((wallet: IWallet) => (
              <CarouselItem
                className={cn('basic-full sm:basis-1/3 lg:basis-1/4')}
                key={wallet._id}
              >
                <WalletCard
                  wallet={wallet}
                  hideMenu
                />
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </div>

      {/* Transactions */}
      <div className="mt-21 grid grid-cols-5 gap-21/2">
        {/* Calendar */}
        <div className="col-span-5 rounded-lg border border-primary p-3 shadow-lg md:p-21 lg:col-span-3">
          {/* MARK: Nav */}
          <div className="mb-4 flex flex-wrap items-center justify-between gap-1">
            <MonthYearPicker
              currentMonth={currentMonth}
              setCurrentMonth={setCurrentMonth}
            />

            <div className="flex items-center gap-1">
              <Button
                size="icon"
                className="bg-primary text-secondary shadow-md"
                onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
              >
                <LucideChevronLeft />
              </Button>
              <Button
                size="icon"
                className="bg-primary text-secondary shadow-md"
                onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
              >
                <LucideChevronRight />
              </Button>
            </div>
          </div>

          {/* MARK: Days of week */}
          <div className="mb-2 grid grid-cols-7 gap-1">
            {Array.from({ length: 7 }).map((_, i) => {
              const date = new Date(2025, 0, 5 + i)
              return (
                <div
                  key={i}
                  className="py-2 text-center text-sm font-medium text-muted-foreground"
                >
                  {format(date, 'EEE', { locale: getLocale(locale) })}
                </div>
              )
            })}
          </div>

          {/* MARK: Days of month */}
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: monthStart.getDay() }).map((_, index) => (
              <div
                key={`empty-start-${index}`}
                className="h-20 p-1"
              />
            ))}

            {monthDays.map(day => {
              const total = getTotalForDate(day)
              const isSelected = isSameDay(day, selectedDate)

              return (
                <Button
                  key={day.toString()}
                  variant="ghost"
                  className={cn(
                    'relative flex h-20 flex-col items-center justify-start rounded-md p-1 hover:bg-muted',
                    isSelected && 'bg-primary text-secondary shadow-md',
                    !isSameMonth(day, currentMonth) && 'text-muted-foreground opacity-50'
                  )}
                  onClick={() => setSelectedDate(day)}
                >
                  <span
                    className={cn('relative z-10 text-center font-medium', isSelected && 'font-bold')}
                  >
                    {format(day, 'd')}
                  </span>

                  {/* <CreateTransactionDrawer
                    initDate={day.toString()}
                    trigger={
                      <button className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center bg-muted-foreground/10">
                        <LucidePlus />
                      </button>
                    }
                  /> */}

                  {getTransactionsForDate(day).length > 0 && (
                    <div className="relative z-10 mt-auto w-full">
                      <div
                        className={cn(
                          'w-full pr-1 text-center text-xs font-semibold',
                          total < 0 ? 'text-rose-500' : 'text-emerald-500'
                        )}
                      >
                        {total > 0 ? '+' : '-'} ${formatCompactNumber(Math.abs(total), true)}
                      </div>
                      <div className="mt-1 h-0.5 w-full overflow-hidden rounded-full bg-muted-foreground/20">
                        <div
                          className={cn(
                            'h-full rounded-full',
                            total < 0 ? 'bg-rose-500' : 'bg-emerald-500'
                          )}
                          style={{
                            width: `${Math.min((Math.abs(total) / 100) * 100, 100)}%`,
                          }}
                        />
                      </div>
                    </div>
                  )}
                </Button>
              )
            })}

            {Array.from({ length: 6 - monthEnd.getDay() }).map((_, index) => (
              <div
                key={`empty-end-${index}`}
                className="h-20 p-1"
              />
            ))}
          </div>
        </div>

        {/* MARK: Transactions of day */}
        <div className="col-span-5 rounded-lg border border-primary p-3 shadow-lg md:p-21 lg:col-span-2">
          <h2 className="mb-4 font-semibold">
            Transactions for
            <span className="text-muted-foreground/80">
              {format(selectedDate, 'd MMMM, yyyy', { locale: getLocale(locale) })}
            </span>
          </h2>
          <ScrollArea className="lg:max-h-auto flex max-h-[500px] flex-col overflow-y-auto">
            {getTransactionsForDate(selectedDate).length > 0 ? (
              getTransactionsForDate(selectedDate).map((tx, index) => (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 * index }}
                  key={tx._id}
                  className="mb-1"
                >
                  <Transaction
                    transaction={tx}
                    hideMenu
                    key={tx._id}
                  />
                </motion.div>
              ))
            ) : (
              <div className="flex items-center justify-center rounded-md border border-muted-foreground/50 px-2 py-7">
                <p className="text-center text-lg font-semibold text-muted-foreground/50">
                  No transactions for this day
                </p>
              </div>
            )}
          </ScrollArea>
        </div>
      </div>

      {/* Budgets */}
      <Tabs
        defaultValue={groups[0]?.[0]}
        className="mt-21 w-full"
      >
        <TabsList className="flex h-12 justify-start overflow-y-auto">
          {groups.map(([key, { begin, end, budgets }]) => (
            <TabsTrigger
              value={key}
              className={cn(
                'line-clamp-1 h-full w-1/3 min-w-max',
                groups.length === 1 ? 'w-full' : groups.length === 2 ? 'w-1/2' : 'w-1/3'
              )}
              key={key}
            >
              {formatTimeRange(begin, end)}
            </TabsTrigger>
          ))}
        </TabsList>
        {groups.map(([key, { begin, end, budgets }]) => (
          <BudgetTab
            value={key}
            begin={begin}
            end={end}
            budgets={budgets}
            key={key}
            hideMenu
          />
        ))}
      </Tabs>

      <Separator className="my-36 h-0" />
    </div>
  )
}

export default EditUserPage
