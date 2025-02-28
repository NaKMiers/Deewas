'use client'

import BudgetTab from '@/components/BudgetTab'
import CreateBudgetDialog from '@/components/dialogs/CreateBudgetDialog'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAppSelector } from '@/hooks/reduxHook'
import { formatTimeRange } from '@/lib/time'
import { cn } from '@/lib/utils'
import { IFullBudget } from '@/models/BudgetModel'
import { getMyBudgetsApi } from '@/requests/budgetRequests'
import { LucidePlus } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import toast from 'react-hot-toast'

function BudgetsPage() {
  // store
  const { curWallet } = useAppSelector(state => state.wallet)

  // states
  const [groups, setGroups] = useState<any[]>([])
  const [loading, setLoading] = useState<boolean>(false)

  const groupBudgets = useCallback((budgets: IFullBudget[]) => {
    const groups: {
      [key: string]: {
        begin: string
        end: string
        budgets: IFullBudget[]
      }
    } = {}

    budgets.forEach((budget: IFullBudget) => {
      const key = `${budget.begin}-${budget.end}`

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
  }, [])

  const getBudgets = useCallback(async () => {
    if (!curWallet) {
      return toast.error('Select your wallet to see budgets')
    }

    // start loading
    setLoading(true)

    try {
      const { budgets } = await getMyBudgetsApi(`?walletId=${curWallet._id}`)
      console.log('budgets:', budgets)
      groupBudgets(budgets)
    } catch (err: any) {
      console.log(err)
    } finally {
      // stop loading
      setLoading(false)
    }
  }, [groupBudgets, curWallet])

  // initial fetch
  useEffect(() => {
    if (curWallet) {
      getBudgets()
    }
  }, [getBudgets, curWallet])

  return (
    <div className="p-21/2 pb-32 md:p-21">
      {!loading && curWallet ? (
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
                refetch={getBudgets}
                key={key}
              />
            ))}
          </Tabs>
        ) : (
          <div className="flex items-center justify-center rounded-md border border-muted-foreground/50 px-21/2 py-7">
            <p className="text-center text-lg font-semibold text-muted-foreground/50">
              You don&apos;t have any budgets yet. Create one now!
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

      {/* MARK: Create Transaction */}
      <CreateBudgetDialog
        refetch={getBudgets}
        trigger={
          <Button
            variant="default"
            className="fixed bottom-[calc(78px)] right-2 z-20 h-10 rounded-full"
          >
            <LucidePlus size={24} />
            Create Budget
          </Button>
        }
      />
    </div>
  )
}

export default BudgetsPage
