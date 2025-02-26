import {
  LucideChartNoAxesCombined,
  LucideHandCoins,
  LucideTrendingDown,
  LucideTrendingUp,
  LucideWalletCards,
} from 'lucide-react'
import momentTZ from 'moment-timezone'

// MARK: Regular Expressions
export const EXTRACT_EMAIL_REGEX = /([A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,})/g

// MARK: Date Range Options
export const getRangeOptions = () => [
  {
    label: 'Today',
    range: [
      {
        startDate: momentTZ().toDate(),
        endDate: momentTZ().toDate(),
        key: 'selection',
      },
    ],
  },
  {
    label: 'Yesterday',
    range: [
      {
        startDate: momentTZ().subtract(1, 'days').toDate(),
        endDate: momentTZ().subtract(1, 'days').toDate(),
        key: 'selection',
      },
    ],
  },
  {
    label: 'Last 7 days',
    range: [
      {
        startDate: momentTZ().subtract(7, 'days').toDate(),
        endDate: momentTZ().subtract(1, 'days').toDate(),
        key: 'selection',
      },
    ],
  },
  {
    label: 'Last 30 days',
    range: [
      {
        startDate: momentTZ().subtract(30, 'days').toDate(),
        endDate: momentTZ().subtract(1, 'days').toDate(),
        key: 'selection',
      },
    ],
  },
  {
    label: 'Last 90 days',
    range: [
      {
        startDate: momentTZ().subtract(90, 'days').toDate(),
        endDate: momentTZ().subtract(1, 'days').toDate(),
        key: 'selection',
      },
    ],
  },
  {
    label: 'Last 365 days',
    range: [
      {
        startDate: momentTZ().subtract(365, 'days').toDate(),
        endDate: momentTZ().subtract(1, 'days').toDate(),
        key: 'selection',
      },
    ],
  },
  {
    label: 'This month',
    range: [
      {
        startDate: momentTZ().startOf('month').toDate(),
        endDate: momentTZ().endOf('month').toDate(),
        key: 'selection',
      },
    ],
  },
  {
    label: 'Last month',
    range: [
      {
        startDate: momentTZ().subtract(1, 'month').startOf('month').toDate(),
        endDate: momentTZ().subtract(1, 'month').endOf('month').toDate(),
        key: 'selection',
      },
    ],
  },
  {
    label: 'This year',
    range: [
      {
        startDate: momentTZ().startOf('year').toDate(),
        endDate: momentTZ().endOf('year').toDate(),
        key: 'selection',
      },
    ],
  },
  {
    label: 'Last year',
    range: [
      {
        startDate: momentTZ().subtract(1, 'year').startOf('year').toDate(),
        endDate: momentTZ().subtract(1, 'year').endOf('year').toDate(),
        key: 'selection',
      },
    ],
  },
  {
    label: 'Week to date',
    range: [
      {
        startDate: momentTZ().startOf('isoWeek').toDate(),
        endDate: momentTZ().toDate(),
        key: 'selection',
      },
    ],
  },
  {
    label: 'Month to date',
    range: [
      {
        startDate: momentTZ().startOf('month').toDate(),
        endDate: momentTZ().toDate(),
        key: 'selection',
      },
    ],
  },
  {
    label: 'Year to date',
    range: [
      {
        startDate: momentTZ().startOf('year').toDate(),
        endDate: momentTZ().toDate(),
        key: 'selection',
      },
    ],
  },
  {
    label: 'All time',
    range: [
      {
        startDate: momentTZ('2023-09-14').toDate(),
        endDate: momentTZ().toDate(),
        key: 'selection',
      },
    ],
  },
]
