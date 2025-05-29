'use client'

import BudgetTab from '@/components/BudgetTab'
import CreateBudgetDrawer from '@/components/dialogs/CreateBudgetDrawer'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAppDispatch, useAppSelector } from '@/hooks/reduxHook'
import { formatTimeRange } from '@/lib/time'
import { cn } from '@/lib/utils'
import { IFullBudget } from '@/models/BudgetModel'
import { LucidePlus } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useEffect, useState } from 'react'

function BudgetsPage() {
  // hooks
  const dispatch = useAppDispatch()
  const t = useTranslations('budgetPage')

  // store
  const { budgets, loading } = useAppSelector(state => state.budget)

  // states
  const [groups, setGroups] = useState<any[]>([])

  useEffect(() => {
    const groups: {
      [key: string]: {
        begin: string
        end: string
        budgets: IFullBudget[]
      }
    } = {}

    budgets.forEach((budget: IFullBudget) => {
      const key = `${budget.begin}-${budget.end}`
      console.log(key)

      if (!groups[key]) {
        groups[key] = {
          begin: budget.begin,
          end: budget.end,
          budgets: [],
        }
      }

      groups[key].budgets.push(budget)
    })

    setGroups(Object.entries(groups))
  }, [budgets])

  return (
    <div className="container min-h-[calc(100vh-50px)] p-21/2 pb-32 md:p-21">
      {!loading ? (
        groups.length > 0 ? (
          <Tabs
            defaultValue={groups[0]?.[0]}
            className="w-full"
          >
            <TabsList className="flex h-12 justify-start overflow-y-auto">
              {groups.map(([key, { begin, end, budgets }]) => (
                <TabsTrigger
                  value={key}
                  className={cn(
                    'line-clamp-1 h-full w-1/3 min-w-max',
                    groups.length === 1 ? 'w-full' : groups.length === 2 ? 'w-1/2' : 'w-1/3'
                  )}
                  key={key}
                >
                  {formatTimeRange(begin, end)}
                </TabsTrigger>
              ))}
            </TabsList>
            {groups.map(([key, { begin, end, budgets }]) => (
              <BudgetTab
                value={key}
                begin={begin}
                end={end}
                budgets={budgets}
                key={key}
              />
            ))}
          </Tabs>
        ) : (
          <div className="flex items-center justify-center rounded-md border border-muted-foreground/50 px-21/2 py-7">
            <p className="text-center text-lg font-semibold text-muted-foreground/50">
              {t("You don't have any budgets yet, create one now!")}
            </p>
          </div>
        )
      ) : (
        <div className="flex flex-col gap-2">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-96 w-full" />
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton
              className="h-24 w-full"
              key={index}
            />
          ))}
        </div>
      )}

      <Separator className="my-36 h-0" />

      {/* MARK: Create Transaction */}
      <CreateBudgetDrawer
        trigger={
          <Button
            variant="default"
            className="fixed bottom-[calc(78px)] right-2 z-20 h-10 rounded-full xl:right-[calc(50%-640px+21px)]"
          >
            <LucidePlus size={24} />
            {t('Create Budget')}
          </Button>
        }
      />
    </div>
  )
}

export default BudgetsPage
