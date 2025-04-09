import { useAppSelector } from '@/hooks/reduxHook'
import { checkTranType, formatCurrency } from '@/lib/string'
import { cn } from '@/lib/utils'
import { TransactionType } from '@/models/TransactionModel'
import { LucideChevronDown, LucideEye } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Dispatch, memo, SetStateAction, useState } from 'react'
import { Button } from './ui/button'
import { Card, CardContent } from './ui/card'

interface OverviewCardProps {
  className?: string
}

function OverviewCard({ className }: OverviewCardProps) {
  // hooks
  const t = useTranslations('overviewCard')

  // store
  const wallets = useAppSelector(state => state.wallet.wallets).filter(wallet => !wallet.hide)

  // states
  const [collapsed, setCollapsed] = useState<boolean>(false)
  const [showValue, setShowValue] = useState<boolean>(false)

  // values
  const totalIncome = wallets.reduce((acc, wallet) => acc + wallet.income, 0)
  const totalExpense = wallets.reduce((acc, wallet) => acc + wallet.expense, 0)
  const totalSaving = wallets.reduce((acc, wallet) => acc + wallet.saving, 0)
  const totalInvest = wallets.reduce((acc, wallet) => acc + wallet.invest, 0)
  const totalBalance = totalIncome + totalSaving + totalInvest - totalExpense

  return (
    <Card
      className={cn(
        'cursor-pointer overflow-hidden rounded-b-lg rounded-t-none border px-21/2 py-1 shadow-sm md:px-21',
        className
      )}
      onClick={() => setCollapsed(!collapsed)}
    >
      <CardContent className="flex justify-between px-0 pb-2">
        <div>
          <Item
            title={t('Total Balance')}
            value={totalBalance}
            type="balance"
            isEye
            isShow={showValue}
            toggle={setShowValue}
          />
          <div
            className={`trans-300 flex flex-col overflow-hidden ${collapsed ? 'max-h-[300px]' : 'max-h-0'}`}
          >
            <Item
              title={t('Income')}
              value={totalIncome}
              type="income"
              isShow={showValue}
            />
            <Item
              title={t('Expense')}
              value={totalExpense}
              type="expense"
              isShow={showValue}
            />
            <Item
              title={t('Saving')}
              value={totalSaving}
              type="saving"
              isShow={showValue}
            />
            <Item
              title={t('Invest')}
              value={totalInvest}
              type="invest"
              isShow={showValue}
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

export default memo(OverviewCard)

interface CardProps {
  title: string
  value: number
  type: TransactionType | 'balance'
  isEye?: boolean
  isShow?: boolean
  toggle?: Dispatch<SetStateAction<boolean>>
  className?: string
}
function Item({ title, type, value, isEye, isShow, toggle, className }: CardProps) {
  // store
  const currency = useAppSelector(state => state.settings.settings?.currency)

  // values
  const { Icon, color } = checkTranType(type)

  return (
    currency && (
      <div className={cn('flex w-full flex-col px-21/2 py-1', className)}>
        <div className="flex items-center gap-2">
          <Icon
            size={24}
            className={cn(color)}
          />
          {isShow ? (
            <p className="text-xl font-semibold">{formatCurrency(currency, value)}</p>
          ) : (
            <p className="text-xl font-bold tracking-widest">*******</p>
          )}

          {isEye && (
            <Button
              variant="ghost"
              size="icon"
              onClick={e => {
                e.stopPropagation()
                if (toggle) toggle(prev => !prev)
              }}
            >
              <LucideEye />
            </Button>
          )}
        </div>
        <p className={cn('text-sm font-semibold leading-3 tracking-wide text-muted-foreground/80')}>
          {title}
        </p>
      </div>
    )
  )
}
