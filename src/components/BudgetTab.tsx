import BudgetCard from '@/components/BudgetCard'
import CreateBudgetDialog from '@/components/dialogs/CreateBudgetDialog'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { TabsContent } from '@/components/ui/tabs'
import { useAppSelector } from '@/hooks/reduxHook'
import { formatCompactNumber, formatCurrency } from '@/lib/string'
import { IFullBudget } from '@/models/BudgetModel'
import { differenceInDays } from 'date-fns'

interface IBudgetTabProps {
  value: string
  begin: Date | string
  end: Date | string
  budgets: IFullBudget[]
  refetch?: () => void
  className?: string
}

function BudgetTab({ value, begin, end, budgets, refetch, className = '' }: IBudgetTabProps) {
  const {
    settings: { currency },
    exchangeRates,
  } = useAppSelector(state => state.settings)

  // values
  const total = budgets.reduce((acc: number, budget: IFullBudget) => acc + budget.total, 0)
  const amount = budgets.reduce((acc: number, budget: IFullBudget) => acc + budget.amount, 0)
  const daysLeft = differenceInDays(new Date(end), new Date()) + 1

  return (
    <TabsContent value={value}>
      {/* Budget Overview */}
      <Card className="flex flex-col items-center justify-center gap-21 rounded-md px-21/2 py-21 text-center md:px-21">
        <div className="flex flex-col gap-21/2">
          <p className="text-sm font-semibold text-muted-foreground">Amount you can spend</p>
          <p className="text-4xl font-semibold text-green-500">
            {formatCurrency(currency, total - amount, exchangeRates[currency])}
          </p>
          <Progress
            value={(amount / total) * 100}
            className="w-full"
          />
        </div>

        <div className="flex w-full items-center justify-evenly gap-1">
          <div className="flex-1">
            <p className="font-semibold">
              {formatCompactNumber(formatCurrency(currency, total, exchangeRates[currency]), true)}
            </p>
            <p className="text-sm text-muted-foreground">Total budgets</p>
          </div>
          <div className="h-6 w-0.5 bg-muted-foreground" />
          <div className="flex-1">
            <p className="font-semibold">
              {formatCompactNumber(formatCurrency(currency, amount, exchangeRates[currency]), true)}
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

        {/* MARK: Create Budget */}
        <CreateBudgetDialog
          refetch={refetch}
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
            refetch={refetch}
            key={budget._id}
          />
        ))}
      </div>
    </TabsContent>
  )
}

export default BudgetTab
