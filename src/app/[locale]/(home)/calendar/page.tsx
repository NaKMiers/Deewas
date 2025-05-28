'use client'

import CreateTransactionDrawer from '@/components/dialogs/CreateTransactionDrawer'
import MonthYearPicker from '@/components/MonthYearPicker'
import Transaction from '@/components/Transaction'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { useAppDispatch, useAppSelector } from '@/hooks/reduxHook'
import { setRefreshing } from '@/lib/reducers/loadReducer'
import { formatCompactNumber, getLocale } from '@/lib/string'
import { toUTC } from '@/lib/time'
import { cn } from '@/lib/utils'
import { IFullTransaction } from '@/models/TransactionModel'
import { getMyTransactionsApi } from '@/requests'
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
import { LucideChevronLeft, LucideChevronRight, LucidePlus } from 'lucide-react'
import moment from 'moment-timezone'
import { useLocale, useTranslations } from 'next-intl'
import { useCallback, useEffect, useState } from 'react'

function CalendarPage() {
  // hooks
  const locale = useLocale()
  const t = useTranslations('calendarPage')
  const dispatch = useAppDispatch()

  // store
  const { refreshPoint } = useAppSelector(state => state.load)
  const currency = useAppSelector(state => state.settings.settings?.currency)

  // states
  const [transactions, setTransactions] = useState<IFullTransaction[]>([])
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(new Date())

  // Get all days in the current month
  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd })

  // get transactions
  const getTransactions = useCallback(async () => {
    const query = `?from=${toUTC(moment(currentMonth.toISOString()).startOf('month').toDate())}&to=${toUTC(moment(currentMonth.toISOString()).endOf('month').toDate())}`

    try {
      const { transactions } = await getMyTransactionsApi(query)
      setTransactions(transactions)
    } catch (err: any) {
      console.error(err)
    } finally {
      dispatch(setRefreshing(false))
    }
  }, [dispatch, currentMonth])

  useEffect(() => {
    getTransactions()
  }, [getTransactions, refreshPoint])

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

  return (
    <div className="container pb-32">
      {/* MARK: Top */}
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 px-21/2 py-4 md:px-21">
        <h2 className="text-lg font-bold">{t('Calendar')}</h2>
      </div>

      <div className="grid grid-cols-5 gap-21/2 px-21/2 md:gap-21 md:px-21">
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

                  <CreateTransactionDrawer
                    initDate={day.toString()}
                    trigger={
                      <button className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center bg-muted-foreground/10">
                        <LucidePlus />
                      </button>
                    }
                  />

                  {getTransactionsForDate(day).length > 0 && (
                    <div className="relative z-10 mt-auto w-full">
                      <div
                        className={cn(
                          'w-full pr-1 text-center text-xs font-semibold',
                          total < 0 ? 'text-rose-500' : 'text-emerald-500'
                        )}
                      >
                        {currency &&
                          `${total > 0 ? '+' : '-'} ${formatCompactNumber(Math.abs(total), true)}`}
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
            {t('Transactions for')}{' '}
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
                    key={tx._id}
                  />
                </motion.div>
              ))
            ) : (
              <div className="flex items-center justify-center rounded-md border border-muted-foreground/50 px-2 py-7">
                <p className="text-center text-lg font-semibold text-muted-foreground/50">
                  {t('No transactions for this day')}
                </p>
              </div>
            )}
          </ScrollArea>
        </div>
      </div>

      <Separator className="my-36 h-0" />
    </div>
  )
}

export default CalendarPage
