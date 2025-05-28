'use client'

import CreateTransactionDrawer from '@/components/dialogs/CreateTransactionDrawer'
import NoItemsFound from '@/components/NoItemsFound'
import TransactionTypeGroup from '@/components/TransactionTypeGroup'
import { Button } from '@/components/ui/button'
import { DateRangePicker } from '@/components/ui/DateRangePicker'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import WalletPicker from '@/components/WalletPicker'
import { useAppDispatch, useAppSelector } from '@/hooks/reduxHook'
import { useRouter } from '@/i18n/navigation'
import { setTransactions } from '@/lib/reducers/transactionReducer'
import { toUTC } from '@/lib/time'
import { IFullTransaction } from '@/models/TransactionModel'
import { IWallet } from '@/models/WalletModel'
import { getMyTransactionsApi } from '@/requests'
import { differenceInDays } from 'date-fns'
import { LucideCalendarDays, LucidePlus, LucideSearch } from 'lucide-react'
import moment from 'moment-timezone'
import { useLocale, useTranslations } from 'next-intl'
import { useCallback, useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { LuX } from 'react-icons/lu'

function TransactionsPage() {
  // hooks
  const dispatch = useAppDispatch()
  const t = useTranslations('transactionsPage')
  const router = useRouter()
  const locale = useLocale()

  // store
  const { transactions } = useAppSelector(state => state.transaction)
  const { refreshPoint } = useAppSelector(state => state.load)

  // states
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: moment().startOf('month').toDate(),
    to: moment().endOf('month').toDate(),
  })
  const [wallet, setWallet] = useState<IWallet | null>(null)
  const [groups, setGroups] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState<string>('')
  const [isIncludeTransfers, setIsIncludeTransfers] = useState<boolean>(false)

  // get my transactions of selected wallet
  const getMyTransactions = useCallback(async () => {
    let query = `?from=${toUTC(dateRange.from)}&to=${toUTC(dateRange.to)}`
    if (wallet) query += `&wallet=${wallet._id}`

    // start loading
    setLoading(true)

    try {
      const { transactions } = await getMyTransactionsApi(query)
      dispatch(setTransactions(transactions))
    } catch (err: any) {
      console.log(err)
      toast.error(t('Failed to fetch transactions'))
    } finally {
      // stop loading
      setLoading(false)
    }
  }, [dispatch, dateRange, wallet, t])

  // initial fetch
  useEffect(() => {
    getMyTransactions()
  }, [getMyTransactions, refreshPoint])

  // auto group categories by type
  useEffect(() => {
    const groups: any = {}

    const filteredTransactions = transactions.filter((transaction: IFullTransaction) => {
      const { category, name, type, amount } = transaction
      const key = (category.name + category.icon + name + type + amount).toLowerCase()

      return key.includes(search.toLowerCase())
    })

    filteredTransactions.forEach((transaction: IFullTransaction) => {
      const type = transaction.type

      if (!groups[type]) {
        groups[type] = []
      }

      groups[type].push(transaction)
    })

    for (const type in groups) {
      const categoryGroups: any = {}

      groups[type].forEach((transaction: IFullTransaction) => {
        const category = transaction.category._id

        if (!categoryGroups[category]) {
          categoryGroups[category] = {
            category: transaction.category,
            transactions: [],
          }
        }

        categoryGroups[category].transactions.push(transaction)
      })

      groups[type] = categoryGroups
    }

    setGroups(Object.entries(groups))
  }, [transactions, search])

  return (
    <div className="container min-h-[calc(100vh-50px)] p-21/2 pb-32 md:p-21">
      {/* MARK: Top */}
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 px-21/2 py-4 md:px-21">
        <h2 className="text-lg font-bold">
          {t('Transactions')} <span className="text-muted-foreground/50">{t('of')}</span>
        </h2>

        <WalletPicker
          wallet={wallet as IWallet}
          isAllowedAll
          onChange={(wallet: IWallet | null) => setWallet(wallet)}
        />
      </div>

      {/* MARK: Date Range */}
      <div className="mb-21/2 flex items-center justify-between gap-2 px-21/2 md:px-21">
        <div className="flex flex-1 items-center justify-start gap-2 px-2">
          <Switch
            checked={isIncludeTransfers}
            onCheckedChange={() => setIsIncludeTransfers(!isIncludeTransfers)}
            className="bg-gray-300 data-[state=checked]:bg-violet-500"
          />
          <p className="font-medium">{t('Include transfers')}</p>
        </div>
        <DateRangePicker
          initialDateFrom={dateRange.from}
          initialDateTo={dateRange.to}
          showCompare={false}
          className="border border-primary/10 bg-primary text-secondary shadow-md hover:bg-primary hover:text-secondary"
          onUpdate={values => {
            const { from, to } = values.range

            if (!from || !to) return
            if (differenceInDays(to, from) > +90) {
              toast.error(
                `${t('The selected date range is too large')}. ${t('Max allowed range is')} ${90} ${t('days!')}`
              )
              return
            }

            setDateRange({ from, to })
          }}
        />
      </div>

      {/* MARK: Search & Calendar */}
      <div className="mb-21/2 flex items-center justify-end gap-2 px-21/2 md:px-21">
        {/* Search */}
        <div className="relative flex w-full overflow-hidden rounded-md shadow-sm">
          <button className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-l-md rounded-r-none bg-primary text-secondary">
            <LucideSearch size={20} />
          </button>

          <Input
            className="h-10 rounded-l-none border border-primary pr-10 !ring-0"
            placeholder={t('Search') + '...'}
            value={search}
            onChange={e => setSearch(e.target.value)}
          />

          {search.trim() && (
            <Button
              variant="ghost"
              className="absolute right-0 top-1/2 -translate-y-1/2"
              size="icon"
              onClick={() => setSearch('')}
            >
              <LuX />
            </Button>
          )}
        </div>

        {/* Calendar */}
        <button
          className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-primary text-secondary"
          onClick={() => router.push('/calendar', { locale })}
        >
          <LucideCalendarDays size={20} />
        </button>
      </div>

      {/* MARK: Groups */}
      <div className="flex flex-col gap-2 px-21/2 md:px-21">
        {groups.length > 0 ? (
          groups.map(([type, group]) => (
            <TransactionTypeGroup
              type={type}
              categoryGroups={Object.entries(group).map(g => g[1])}
              includeTransfers={isIncludeTransfers}
              key={type}
            />
          ))
        ) : (
          <NoItemsFound text={t('No transactions found, just add one now!')} />
        )}
      </div>

      <Separator className="my-36 h-0" />

      {/* MARK: Create Transaction */}
      <CreateTransactionDrawer
        initWallet={wallet || undefined}
        trigger={
          <Button
            variant="default"
            className="fixed bottom-[calc(78px)] right-2 z-20 h-10 rounded-full xl:right-[calc(50%-640px+21px)]"
          >
            <LucidePlus size={24} />
            {t('Add Transaction')}
          </Button>
        }
      />
    </div>
  )
}

export default TransactionsPage
