import { useAppSelector } from '@/hooks/reduxHook'
import { checkTranType, formatCurrency } from '@/lib/string'
import { cn } from '@/lib/utils'
import { TransactionType } from '@/models/TransactionModel'
import { LucideChevronDown } from 'lucide-react'
import { useState } from 'react'
import { Card, CardContent } from './ui/card'

interface OverviewCardProps {
  className?: string
}

function OverviewCard({ className = '' }: OverviewCardProps) {
  // store
  const { wallets } = useAppSelector(state => state.wallet)

  // states
  const [collapsed, setCollapsed] = useState<boolean>(false)

  // values
  const totalIncome = wallets.reduce((acc, wallet) => acc + wallet.income, 0)
  const totalExpense = wallets.reduce((acc, wallet) => acc + wallet.expense, 0)
  const totalBalance = totalIncome - totalExpense
  const totalSaving = wallets.reduce((acc, wallet) => acc + wallet.saving, 0)
  const totalInvest = wallets.reduce((acc, wallet) => acc + wallet.invest, 0)

  return (
    <Card
      className={cn('cursor-pointer overflow-hidden rounded-none border-0 py-1', className)}
      onClick={() => setCollapsed(!collapsed)}
    >
      <CardContent className="flex justify-between px-0 pb-2">
        <div>
          <Item
            title="Total Balance"
            value={totalBalance}
            type="balance"
          />
          <div
            className={`trans-300 flex flex-col overflow-hidden ${collapsed ? 'max-h-[300px]' : 'max-h-0'}`}
          >
            <Item
              title="Income"
              value={totalIncome}
              type="income"
            />
            <Item
              title="Expense"
              value={totalExpense}
              type="expense"
            />
            <Item
              title="Saving"
              value={totalSaving}
              type="saving"
            />
            <Item
              title="Invest"
              value={totalInvest}
              type="invest"
            />
          </div>
        </div>

        <div className="flex h-12 items-center justify-center px-21/2 text-muted-foreground">
          <LucideChevronDown
            size={18}
            className={`trans-200 ${collapsed ? 'rotate-180' : ''}`}
          />
        </div>
      </CardContent>
    </Card>
  )
}

export default OverviewCard

interface CardProps {
  title: string
  value: number
  type: TransactionType | 'balance'
  className?: string
}
function Item({ title, type, value }: CardProps) {
  // store
  const currency = useAppSelector(state => state.settings.settings?.currency)

  // values
  const { Icon, color } = checkTranType(type)

  return (
    currency && (
      <div className={`flex w-full flex-col px-21/2 py-1`}>
        <div className="flex items-center gap-2">
          <Icon
            size={24}
            className={cn(color)}
          />
          <span className="text-xl font-semibold">{formatCurrency(currency, value)}</span>
        </div>
        <p className={cn('text-sm font-semibold leading-3 tracking-wide text-muted-foreground')}>
          {title}
        </p>
      </div>
    )
  )
}
