import BudgetCard from '@/components/BudgetCard'
import CreateBudgetDrawer from '@/components/dialogs/CreateBudgetDrawer'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { TabsContent } from '@/components/ui/tabs'
import { useAppDispatch, useAppSelector } from '@/hooks/reduxHook'
import { addBudget } from '@/lib/reducers/budgetReducer'
import { checkLevel, formatCompactNumber, formatCurrency } from '@/lib/string'
import { cn } from '@/lib/utils'
import { IFullBudget } from '@/models/BudgetModel'
import { differenceInDays } from 'date-fns'
import { useLocale, useTranslations } from 'next-intl'
import { memo } from 'react'

interface IBudgetTabProps {
  value: string
  begin: Date | string
  end: Date | string
  budgets: IFullBudget[]
  className?: string
}

function BudgetTab({ value, begin, end, budgets, className }: IBudgetTabProps) {
  // hooks
  const dispatch = useAppDispatch()
  const t = useTranslations('budgetTab')
  const locale = useLocale()

  // store
  const currency = useAppSelector(state => state.settings.settings?.currency)

  // values
  const total = budgets.reduce((acc: number, budget: IFullBudget) => acc + budget.total, 0)
  const amount = budgets.reduce((acc: number, budget: IFullBudget) => acc + budget.amount, 0)
  const daysLeft = differenceInDays(new Date(end), new Date())
  let dailyLimit = (total - amount) / daysLeft
  dailyLimit = dailyLimit > 10000 ? Math.round(dailyLimit) : dailyLimit

  return (
    <TabsContent
      value={value}
      className={cn(className)}
    >
      {/* Budget Overview */}
      <div className="flex flex-col items-center justify-center gap-21 rounded-xl bg-primary px-21/2 py-21 text-center text-secondary shadow-md md:px-21">
        <div className="flex w-full flex-col items-center gap-21/2">
          <p className="text-sm font-semibold text-muted-foreground">{t('Amount you can spend')}</p>
          {currency && (
            <p className="text-4xl font-semibold text-green-500">
              {formatCurrency(currency, total - amount)}
            </p>
          )}
          <div className="relative h-2 w-full max-w-[300px] overflow-hidden rounded-xl bg-muted-foreground">
            <div
              className={cn(
                'absolute left-0 top-0 h-full',
                checkLevel((amount / total) * 100).background
              )}
              style={{ width: `${(amount / total) * 100}%` }}
            />
          </div>
        </div>

        {currency && (
          <div className="grid w-full grid-cols-2 items-center justify-evenly gap-1 gap-y-2 md:grid-cols-4">
            <div className="flex-1">
              <p className="font-semibold">
                {formatCompactNumber(formatCurrency(currency, total), true)}
              </p>
              <p className="text-sm tracking-tight text-muted-foreground">{t('Total budgets')}</p>
            </div>
            <div className="flex-1">
              <p className="font-semibold">
                {formatCompactNumber(formatCurrency(currency, amount), true)}
              </p>
              <p className="text-sm tracking-tight text-muted-foreground">{t('Total spent')}</p>
            </div>
            <div className="flex-1">
              <p className="font-semibold">
                {daysLeft} {t('day')}
                {daysLeft !== 1 && locale === 'en' && 's'}
              </p>
              <p className="text-sm tracking-tight text-muted-foreground">{t('End of month')}</p>
            </div>
            <div className="flex-1">
              <p className="font-semibold">
                {total - amount > 0
                  ? formatCurrency(currency, dailyLimit) + '/' + t('day')
                  : formatCurrency(currency, 0)}
              </p>
              <p className="text-sm tracking-tight text-muted-foreground">{t('Daily limit')}</p>
            </div>
          </div>
        )}

        {/* MARK: Create Budget */}
        <CreateBudgetDrawer
          update={(budget: IFullBudget) => dispatch(addBudget(budget))}
          trigger={
            <Button
              variant="secondary"
              className="rounded-full shadow-md"
            >
              {t('Create Budget')}
            </Button>
          }
        />
      </div>

      {/* Budget List */}
      <div className="mt-2 flex flex-col gap-2">
        {budgets.map((budget: IFullBudget) => (
          <BudgetCard
            begin={begin}
            end={end}
            budget={budget}
            key={budget._id}
          />
        ))}
      </div>
    </TabsContent>
  )
}

export default memo(BudgetTab)
