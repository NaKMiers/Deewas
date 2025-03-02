import BudgetCard from '@/components/BudgetCard'
import CreateBudgetDrawer from '@/components/dialogs/CreateBudgetDrawer'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { TabsContent } from '@/components/ui/tabs'
import { useAppDispatch, useAppSelector } from '@/hooks/reduxHook'
import { addBudget } from '@/lib/reducers/budgetReducer'
import { formatCompactNumber, formatCurrency } from '@/lib/string'
import { cn } from '@/lib/utils'
import { IFullBudget } from '@/models/BudgetModel'
import { differenceInDays } from 'date-fns'

interface IBudgetTabProps {
  value: string
  begin: Date | string
  end: Date | string
  budgets: IFullBudget[]
  className?: string
}

function BudgetTab({ value, begin, end, budgets, className = '' }: IBudgetTabProps) {
  // hooks
  const dispatch = useAppDispatch()

  // store
  const currency = useAppSelector(state => state.settings.settings?.currency)

  // values
  const total = budgets.reduce((acc: number, budget: IFullBudget) => acc + budget.total, 0)
  const amount = budgets.reduce((acc: number, budget: IFullBudget) => acc + budget.amount, 0)
  const daysLeft = differenceInDays(new Date(end), new Date()) + 1

  return (
    <TabsContent
      value={value}
      className={cn(className)}
    >
      {/* Budget Overview */}
      <Card className="flex flex-col items-center justify-center gap-21 rounded-md px-21/2 py-21 text-center md:px-21">
        <div className="flex flex-col gap-21/2">
          <p className="text-sm font-semibold text-muted-foreground">Amount you can spend</p>
          {currency && (
            <p className="text-4xl font-semibold text-green-500">
              {formatCurrency(currency, total - amount)}
            </p>
          )}
          <Progress
            value={(amount / total) * 100}
            className="w-full"
          />
        </div>

        {currency && (
          <div className="flex w-full items-center justify-evenly gap-1">
            {
              <div className="flex-1">
                <p className="font-semibold">
                  {formatCompactNumber(formatCurrency(currency, total), true)}
                </p>
                <p className="text-sm text-muted-foreground">Total budgets</p>
              </div>
            }
            <div className="h-6 w-0.5 bg-muted-foreground" />
            <div className="flex-1">
              <p className="font-semibold">
                {formatCompactNumber(formatCurrency(currency, amount), true)}
              </p>
              <p className="text-sm text-muted-foreground">Total spent</p>
            </div>
            <div className="h-6 w-0.5 bg-muted-foreground" />
            <div className="flex-1">
              <p className="font-semibold">
                {daysLeft} day
                {daysLeft !== 1 && 's'}
              </p>
              <p className="text-sm text-muted-foreground">End of month</p>
            </div>
          </div>
        )}

        {/* MARK: Create Budget */}
        <CreateBudgetDrawer
          update={(budget: IFullBudget) => dispatch(addBudget(budget))}
          trigger={
            <Button
              variant="default"
              className="rounded-full"
            >
              Create Budget
            </Button>
          }
        />
      </Card>

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

export default BudgetTab
