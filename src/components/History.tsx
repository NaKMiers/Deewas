import { useAppSelector } from '@/hooks/reduxHook'
import { formatCurrency, parseCurrency } from '@/lib/string'
import { toUTC } from '@/lib/time'
import { cn } from '@/lib/utils'
import { IFullTransaction, ITransaction, TransactionType } from '@/models/TransactionModel'
import { getHistoryApi } from '@/requests'
import { differenceInDays } from 'date-fns'
import moment from 'moment-timezone'
import { useSession } from 'next-auth/react'
import { useLocale, useTranslations } from 'next-intl'
import { memo, ReactNode, useCallback, useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import Chart, { ChartDatum } from './Chart'
import { Button } from './ui/button'
import { DateRangePicker } from './ui/DateRangePicker'
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'

interface HistoryProps {
  className?: string
}

function History({ className = '' }: HistoryProps) {
  // hooks
  const { data: session } = useSession()
  const user = session?.user
  const t = useTranslations('history')
  const locale = useLocale()

  const types: TransactionType[] = ['balance', 'income', 'expense', 'saving', 'invest']
  const charts = ['bar', 'line', 'area', 'radar', 'pie']

  // store
  const { refetching } = useAppSelector(state => state.load)
  const currency = useAppSelector(state => state.settings.settings?.currency)

  // states
  const [chart, setChart] = useState<string>(charts[0])
  const [selectedTypes, setSelectedTypes] = useState<TransactionType[]>(['income', 'expense'])
  const [data, setData] = useState<any[]>([])
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: moment().startOf('month').toDate(),
    to: moment().endOf('month').toDate(),
  })
  const [loading, setLoading] = useState<boolean>(false)
  const [transactions, setTransactions] = useState<IFullTransaction[]>([])

  const findMaxKey = useCallback(
    (data: ITransaction[]) => {
      let max = 0
      let key = ''
      for (const transaction of data) {
        if (transaction.amount > max) {
          max = transaction.amount
          key = selectedTypes.includes(transaction.type) ? transaction.type : key
        }
      }
      return key
    },
    [selectedTypes]
  )

  // get history
  const getHistory = useCallback(async () => {
    if (!user) return

    // start loading
    setLoading(true)

    try {
      const from = toUTC(dateRange.from)
      const to = toUTC(dateRange.to)

      const { transactions } = await getHistoryApi(`?from=${from}&to=${to}`)
      setTransactions(transactions)
    } catch (err: any) {
      console.log(err)
    } finally {
      // stop loading
      setLoading(false)
    }
  }, [user, dateRange])

  // initially get history
  useEffect(() => {
    getHistory()
  }, [getHistory, refetching])

  // auto update chart data
  useEffect(() => {
    if (!transactions.length || !currency) return

    let incomes = transactions.filter(t => t.type === 'income')
    let expenses = transactions.filter(t => t.type === 'expense')
    let savings = transactions.filter(t => t.type === 'saving')
    let invests = transactions.filter(t => t.type === 'invest')

    // x = end date - start date
    // x > 1 years -> split charts into cols of years
    // 1 year >= x > 1 months -> split charts into cols of months
    // 1 month >= x > 1 days -> split charts into cols of days
    // 1 day >= x > 1 hours -> split charts into cols of hours

    const start = toUTC(moment(dateRange.from).startOf('day').toDate())
    const end = toUTC(moment(dateRange.to).endOf('day').toDate())

    const duration = moment(end).diff(moment(start), 'seconds')
    const oneDayInSeconds = 24 * 60 * 60

    let splitGranularity = 'years'
    if (duration > oneDayInSeconds * 366) {
      // > 1 year
      splitGranularity = 'years'
    } else if (duration > oneDayInSeconds * 62) {
      // > 2 months
      splitGranularity = 'months'
    } else if (duration > oneDayInSeconds) {
      // > 1 day
      splitGranularity = 'days'
    } else if (duration > 60 * 60) {
      // > 1 hour
      splitGranularity = 'hours'
    }

    // Initialize an empty data object
    const groupedData: ChartDatum[] = []
    const iterator = moment(start)

    while (iterator.isBefore(end)) {
      const colStart = iterator.clone()
      let colEnd = colStart.clone().endOf(splitGranularity as moment.unitOfTime.StartOf)

      // Filter transactions in this range
      const chunkIncomeTransactions = incomes.filter((transaction: ITransaction) => {
        const transactionDate = moment(transaction.date).utc()
        return transactionDate.isBetween(colStart, colEnd, undefined, '[)')
      })

      // Filter expense in this range
      const chunkExpenseTransactions = expenses.filter((transaction: ITransaction) => {
        const transactionDate = moment(transaction.date).utc()
        return transactionDate.isBetween(colStart, colEnd, undefined, '[)')
      })

      // Filter saving in this range
      const chunkSavingTransactions = savings.filter((transaction: ITransaction) => {
        const transactionDate = moment(transaction.date).utc()
        return transactionDate.isBetween(colStart, colEnd, undefined, '[)')
      })

      // Filter invest in this range
      const chunkInvestTransactions = invests.filter((transaction: ITransaction) => {
        const transactionDate = moment(transaction.date).utc()
        return transactionDate.isBetween(colStart, colEnd, undefined, '[)')
      })

      // Calculate total value
      let totalIncomeTransactionValue = chunkIncomeTransactions.reduce(
        (total: number, transaction: any) => total + transaction.amount,
        0
      )

      // Calculate total value
      let totalExpenseTransactionValue = chunkExpenseTransactions.reduce(
        (total: number, transaction: any) => total + transaction.amount,
        0
      )

      // Calculate total value
      let totalSavingTransactionValue = chunkSavingTransactions.reduce(
        (total: number, transaction: any) => total + transaction.amount,
        0
      )

      // Calculate total value
      let totalInvestTransactionValue = chunkInvestTransactions.reduce(
        (total: number, transaction: any) => total + transaction.amount,
        0
      )

      let dateFormat = 'DD'
      switch (splitGranularity) {
        case 'years':
          dateFormat = 'YYYY'
          break
        case 'months':
          dateFormat = 'MMM'
          break
        case 'days':
          dateFormat = 'MMM DD'
          break
        case 'hours':
          dateFormat = 'HH:00'
          break
        default:
          break
      }

      groupedData.push({
        name: colStart.format(dateFormat),
        income: parseCurrency(formatCurrency(currency, totalIncomeTransactionValue)),
        expense: parseCurrency(formatCurrency(currency, totalExpenseTransactionValue)),
        balance: parseCurrency(
          formatCurrency(currency, totalIncomeTransactionValue - totalExpenseTransactionValue)
        ),
        saving: parseCurrency(formatCurrency(currency, totalSavingTransactionValue)),
        invest: parseCurrency(formatCurrency(currency, totalInvestTransactionValue)),
      })

      iterator.add(1, splitGranularity as moment.unitOfTime.DurationConstructor)
    }

    setData(groupedData)
  }, [dateRange, transactions, currency])

  return (
    <div className={cn('px-21/2 md:px-21', className)}>
      {/* Top */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">{t('History')}</h2>

        <DateRangePicker
          locale={locale}
          initialDateFrom={dateRange.from}
          initialDateTo={dateRange.to}
          showCompare={false}
          onUpdate={values => {
            const { from, to } = values.range

            if (!from || !to) return
            if (differenceInDays(to, from) > +90) {
              toast.error(`The selected date range is too large. Max allowed range is ${90} days!`)
              return
            }
            setDateRange({ from, to })
          }}
        />
      </div>

      <div className="mt-1.5 rounded-lg border border-muted-foreground/50 px-0">
        <div className="flex flex-wrap justify-end gap-21/2 p-21/2">
          <MultipleSelection
            trigger={
              <Button
                variant="outline"
                className="h-9 px-21/2 text-sm font-semibold"
              >
                {selectedTypes.length} {selectedTypes.length !== 1 ? t('types') : t('type')}
              </Button>
            }
            list={types}
            selected={selectedTypes}
            onChange={(list: any[]) => setSelectedTypes(list)}
          />

          <Select
            value={chart}
            onValueChange={setChart}
          >
            <SelectTrigger className="max-w-max gap-1.5 font-semibold capitalize !ring-0">
              <SelectValue placeholder="Select Chart" />
            </SelectTrigger>
            <SelectContent className="">
              {charts.map(chart => (
                <SelectItem
                  key={chart}
                  value={chart}
                  className="cursor-pointer capitalize"
                >
                  {t(chart)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Chart
          maxKey={findMaxKey(transactions)}
          chart={chart}
          types={selectedTypes}
          data={data}
          className="-ml-21 pr-21/2"
        />
      </div>
    </div>
  )
}

export default memo(History)

interface MultiSelectionProps {
  trigger: ReactNode
  list: any[]
  selected: any[]
  onChange: (value: any) => void
}

export function MultipleSelection({ trigger, list, selected, onChange }: MultiSelectionProps) {
  // hooks
  const t = useTranslations('multipleSelection')

  // states
  const [open, setOpen] = useState<boolean>(false)
  const isObjectItem = typeof list[0] === 'object'

  return (
    <Popover
      open={open}
      onOpenChange={setOpen}
    >
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      <PopoverContent className="z-10 mt-2 flex max-w-max flex-col overflow-hidden rounded-lg p-0">
        <Button
          variant="outline"
          className={cn(
            'trans-200 h-8 justify-start rounded-none border-0 px-3 text-left text-sm font-light',
            selected.length === list.length && 'border-l-2 border-primary pl-2'
          )}
          onClick={selected.length === list.length ? () => onChange([]) : () => onChange(list)}
        >
          <span className="text-nowrap">{t('All')}</span>
        </Button>
        {list.map((item, index) => (
          <Button
            variant="outline"
            className={cn(
              'trans-200 h-8 justify-start rounded-none border-0 px-3 text-left text-sm font-light',
              (isObjectItem
                ? selected.some((ele: any) => ele._id.toString() === item._id.toString())
                : selected.includes(item)) && 'border-l-2 border-primary pl-2'
            )}
            onClick={() => {
              if (isObjectItem) {
                if (selected.some((ele: any) => ele._id.toString() === item._id.toString())) {
                  return onChange(selected.filter(ele => ele._id.toString() !== item._id.toString()))
                } else {
                  return onChange([...selected, item])
                }
              } else {
                if (selected.includes(item)) {
                  return onChange(selected.filter(ele => ele !== item))
                } else {
                  return onChange([...selected, item])
                }
              }
            }}
            key={index}
          >
            <p className="text-nowrap capitalize">{isObjectItem ? t(item.name) : t(item)}</p>
          </Button>
        ))}
      </PopoverContent>
    </Popover>
  )
}
