'use client'

import History from '@/components/History'
import { DateRangePicker } from '@/components/ui/DateRangePicker'
import { Separator } from '@/components/ui/separator'
import Wallets from '@/components/Wallets'
import { differenceInDays } from 'date-fns'
import moment from 'moment-timezone'
import { useCallback, useEffect, useState } from 'react'
import toast from 'react-hot-toast'

function HomePage() {
  // states
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: moment().startOf('month').toDate(),
    to: moment().toDate(),
  })

  const [loading, setLoading] = useState<boolean>(false)

  // get overview
  const getOverview = useCallback(async () => {
    // start loading
    setLoading(true)

    try {
    } catch (err: any) {
      console.log(err)
    } finally {
      // stop loading
      setLoading(false)
    }
  }, [])

  // initially get stats
  useEffect(() => {
    getOverview()
  }, [getOverview])

  return (
    <div className="">
      <div className="flex items-center justify-end px-21/2 py-4 md:px-21">
        <DateRangePicker
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

      <Wallets />

      <Separator className="my-8 h-0" />

      <History />
    </div>
  )
}

export default HomePage
