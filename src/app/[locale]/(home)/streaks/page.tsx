'use client'

import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { useAppDispatch, useAppSelector } from '@/hooks/reduxHook'
import { Link } from '@/i18n/navigation'
import { setStats } from '@/lib/reducers/userReducer'
import { getLocale, shortName } from '@/lib/string'
import { toUTC } from '@/lib/time'
import { ITransaction } from '@/models/TransactionModel'
import { getUserStatsApi } from '@/requests'
import { format } from 'date-fns'
import moment from 'moment'
import { useSession } from 'next-auth/react'
import { useLocale, useTranslations } from 'next-intl'
import Image from 'next/image'
import { useCallback, useEffect, useState } from 'react'

export interface Stats {
  transactionCount: number
  recentTransactions: ITransaction[]
  walletCount: number
  categoryCount: number
  budgetCount: number
  currentStreak: number
  longestStreak: number
}

function StreaksPage() {
  // hooks
  const { data: session } = useSession()
  const user: any = session?.user
  const t = useTranslations('streaksPage')
  const locale = useLocale()
  const dispatch = useAppDispatch()

  // store
  const stats = useAppSelector(state => state.user.stats)

  // states
  const [statList, setStatList] = useState<{ title: string; value: number }[] | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [transactionDays, setTransactionDays] = useState<string[]>([])
  const [weekStreak, setWeekStreak] = useState<number>(0)

  // values
  const weekStart = moment().startOf('week')
  const weekDays: moment.Moment[] = Array.from({ length: 7 }, (_, i) => moment(weekStart).add(i, 'days'))

  // get user stats
  useEffect(() => {
    const fetch = async () => {
      if (stats) return

      // start loading
      setLoading(true)

      try {
        // get stats
        const stats: Stats = await getUserStatsApi(
          `?from=${toUTC(moment().startOf('week').toDate())}&to=${toUTC(moment().endOf('week').toDate())}`
        )
        dispatch(setStats(stats))
      } catch (err: any) {
        console.log(err)
      } finally {
        // stop loading
        setLoading(false)
      }
    }

    fetch()
  }, [dispatch, stats])

  useEffect(() => {
    if (!stats) return

    // set stats list
    setStatList([
      { title: 'Transactions', value: stats.transactionCount },
      { title: 'Wallets', value: stats.walletCount },
      { title: 'Categories', value: stats.categoryCount },
      { title: 'Budgets', value: stats.budgetCount },
    ])

    // set transaction days
    const transactionDays: string[] = Array.from(
      new Set(stats.recentTransactions.map((tx: any) => moment(tx.createdAt).format('YYYY-MM-DD')))
    )
    setTransactionDays(transactionDays)

    // set week streak
    let weekStreak = 0
    const today = moment().format('YYYY-MM-DD')
    for (let day of weekDays) {
      const dayKey = day.format('YYYY-MM-DD')
      if (dayKey > today) break
      if (transactionDays.includes(dayKey)) weekStreak++
      else break
    }
    setWeekStreak(weekStreak)

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stats])

  // get streak message
  const getStreakMessage = useCallback(
    (streak: number, name: string) => {
      if (streak >= 7) return `${t("You're unstoppable this week!")} ${name} 🔥🔥🔥`
      if (streak >= 5) return `${t("You're crushing it! Keep pushing")} ${name} 💪`
      if (streak >= 3) return `${t("You're building a great habit!")} ${name} 🙌`
      if (streak >= 1) return `${t('Nice! One step at a time')} ${name} 🚶‍♂️`
      return `${t('New week, new chance')}. ${t('Let’s get it')} ${name}! 🚀`
    },
    [t]
  )

  return (
    <div className="mx-auto flex min-h-[calc(100vh-50px)] w-full max-w-lg flex-col items-center p-21">
      {/* Flame */}
      <div
        className="aspect-square rounded-full border border-orange-500 p-14 shadow-md"
        style={{ height: 250 }}
      >
        {!loading ? (
          <Image
            src={weekStreak > 0 ? '/icons/in-streak.gif' : '/icons/lost-streak.gif'}
            width={250}
            height={250}
            alt="streaks"
            className="h-full w-full object-cover"
          />
        ) : (
          <Skeleton className="h-full w-full rounded-full" />
        )}
      </div>

      {/* Streak Count */}
      <div
        className="aspect-square items-center justify-center overflow-hidden rounded-full shadow-md"
        style={{ marginTop: -50 }}
      >
        {!loading ? (
          <div className="flex h-[100px] w-[100px] items-center justify-center bg-orange-500 font-body text-[80px] font-bold text-white">
            {!loading && weekStreak}
          </div>
        ) : (
          <Skeleton className="h-[150px] w-[150px] rounded-full" />
        )}
      </div>

      {/* Title & Compliment */}
      <p className="mt-6 font-body text-3xl font-semibold tracking-widest">{t('Week Streak')}</p>
      <p className="text-center text-lg font-medium">{getStreakMessage(weekStreak, shortName(user))}</p>

      {/* Week */}
      <div className="mt-6 flex w-full flex-row flex-wrap justify-center gap-2">
        {weekDays.map((day, i) => {
          const dayKey = day.format('YYYY-MM-DD')
          const hasTransaction = transactionDays.includes(dayKey)

          return (
            <div
              key={i}
              className="flex w-[calc(100%/8)] flex-col items-center"
            >
              <Image
                src={hasTransaction ? '/icons/fire.png' : '/icons/pale-fire.png'}
                width={40}
                height={40}
                alt="streak"
                className="flex h-10 w-10 items-center justify-center"
              />
              <p className="mt-1 text-center font-bold">
                {format(day.toDate(), 'EEEEE', { locale: getLocale(locale) })}
              </p>
            </div>
          )
        })}
      </div>

      <div className="mt-8 flex flex-row items-center justify-center gap-21">
        <div>
          <p className="text-lg font-semibold">{t('Current streak')}</p>
          <p className="text-center text-2xl font-bold">{stats?.currentStreak}</p>
        </div>
        <div>
          <p className="text-lg font-semibold">{t('Longest streak')}</p>
          <p className="text-center text-2xl font-bold">{stats?.longestStreak}</p>
        </div>
      </div>

      {/* Stat */}
      {!loading && statList ? (
        <div className="mt-8 w-full overflow-hidden rounded-3xl border border-primary/10 shadow-md">
          <p className="py-2.5 text-center text-lg font-bold">{t('Your Stats')}</p>
          <div className="rounded-3x rounded-3xl bg-primary px-8 py-21 shadow-md">
            <div className="flex flex-1 flex-row flex-wrap gap-y-2">
              {statList.map((stat, i) => (
                <div
                  className="w-1/2"
                  key={i}
                >
                  <p className="text-center text-lg font-semibold text-secondary">{t(stat.title)}</p>
                  <p className="text-center text-4xl font-bold text-secondary">{stat.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <Skeleton className="mt-8 h-[200px] w-full p-4" />
      )}

      {/* Action Button */}
      <Link
        href="/"
        className="mt-8 flex h-10 w-full flex-row items-center justify-center gap-21/2 rounded-full bg-orange-500 p-4 shadow-md"
      >
        <p className="text-lg font-semibold text-white">{t('Continue')}</p>
      </Link>

      <Separator className="my-8 w-full" />
    </div>
  )
}

export default StreaksPage
