'use client'

import { useAppDispatch, useAppSelector } from '@/hooks/reduxHook'
import { addBudget, deleteBudget, updateBudget } from '@/lib/reducers/budgetReducer'
import { checkLevel, formatCurrency } from '@/lib/string'
import { cn } from '@/lib/utils'
import { IFullBudget } from '@/models/BudgetModel'
import { deleteBudgetApi } from '@/requests/budgetRequests'
import { differenceInDays } from 'date-fns'
import {
  LucideEllipsis,
  LucideLayers2,
  LucideLoaderCircle,
  LucidePencil,
  LucideTrash,
} from 'lucide-react'
import moment from 'moment-timezone'
import { useTranslations } from 'next-intl'
import { memo, useCallback, useState } from 'react'
import toast from 'react-hot-toast'
import ConfirmDialog from './dialogs/ConfirmDialog'
import CreateBudgetDrawer from './dialogs/CreateBudgetDrawer'
import UpdateBudgetDrawer from './dialogs/UpdateBudgetDrawer'
import { Button } from './ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from './ui/dropdown-menu'

interface IBudgetCardProps {
  begin: Date | string
  end: Date | string
  budget: IFullBudget
  hideMenu?: boolean
  className?: string
}

function BudgetCard({ begin, end, budget, hideMenu, className }: IBudgetCardProps) {
  // hooks
  const dispatch = useAppDispatch()
  const t = useTranslations('budgetCard')

  // store
  const currency = useAppSelector(state => state.settings.settings?.currency)

  // states
  const [deleting, setDeleting] = useState<boolean>(false)

  // values
  const progress = (budget.amount / budget.total) * 100
  const length = differenceInDays(begin, end)
  const spent = differenceInDays(begin, new Date())

  // delete budget
  const handleDeleteBudget = useCallback(async () => {
    // start deleting
    setDeleting(true)
    toast.loading(t('Deleting budget') + '...', { id: 'delete-budget' })

    try {
      const { budget: b, message } = await deleteBudgetApi(budget._id)
      toast.success(message, { id: 'delete-budget' })

      dispatch(deleteBudget(b))
    } catch (err: any) {
      toast.error(err.message, { id: 'delete-budget' })
      console.log(err)
    } finally {
      // stop deleting
      setDeleting(false)
    }
  }, [dispatch, budget._id, t])

  return (
    <div className={cn('rounded-xl border border-primary/10 bg-secondary/50 px-3 pb-8 pt-2', className)}>
      <div className="flex items-center justify-between gap-1">
        {/* MARK: Category & Amount */}
        <div className="flex items-center gap-2 text-sm font-semibold">
          <span>{budget.category.icon}</span>
          <span>{budget.category.name}</span> <div className="h-5 w-0.5 bg-muted-foreground/50" />
          {currency && (
            <span className="text-sm font-semibold tracking-tight">
              {formatCurrency(currency, budget.total)}
            </span>
          )}
        </div>

        {!hideMenu && !deleting ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
              >
                <LucideEllipsis />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {/* MARK: Duplicate */}
              <CreateBudgetDrawer
                initTotal={budget.total}
                initCategory={budget.category}
                initBegin={moment(budget.begin).add(1, 'month').toDate()}
                initEnd={moment(budget.end).add(1, 'month').toDate()}
                update={(budget: IFullBudget) => dispatch(addBudget(budget))}
                trigger={
                  <Button
                    variant="ghost"
                    className="flex h-8 w-full items-center justify-start gap-2 px-2 text-violet-500"
                  >
                    <LucideLayers2 size={16} />
                    {t('Create Similar')}
                  </Button>
                }
              />

              {/* MARK: Update */}
              <UpdateBudgetDrawer
                update={(budget: IFullBudget) => dispatch(updateBudget(budget))}
                budget={budget}
                trigger={
                  <Button
                    variant="ghost"
                    className="flex h-8 w-full items-center justify-start gap-2 px-2 text-sky-500"
                  >
                    <LucidePencil size={16} />
                    {t('Edit')}
                  </Button>
                }
              />

              {/* MARK: Delete */}
              <ConfirmDialog
                label={t('Delete Budget')}
                desc={t('Are you sure you want to delete this budget?')}
                confirmLabel={t('Delete')}
                onConfirm={handleDeleteBudget}
                trigger={
                  <Button
                    variant="ghost"
                    className="flex h-8 w-full items-center justify-start gap-2 px-2 text-rose-500"
                  >
                    <LucideTrash size={16} />
                    {t('Delete')}
                  </Button>
                }
              />
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button
            disabled
            variant="ghost"
            size="icon"
          >
            <LucideLoaderCircle className="animate-spin" />
          </Button>
        )}
      </div>

      {/* MARK: Left */}
      <div className="mt-1 px-1">
        <div className="relative h-6 w-full rounded-full bg-primary/10">
          <div
            className={cn('h-full rounded-full', checkLevel(progress).background)}
            style={{ width: `${progress > 100 ? 100 : progress}%` }}
          />
          {currency && (
            <span className="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 text-nowrap font-body text-sm font-semibold tracking-wider">
              {t('Left')} {formatCurrency(currency, budget.total - budget.amount)}
            </span>
          )}
          <div
            className="absolute top-0 h-full w-0.5 -translate-x-1/2 bg-white/50"
            style={{ left: (spent / length) * 100 + '%' }}
          >
            <div className="absolute left-1/2 top-7 -translate-x-1/2 rounded-sm bg-primary/10 px-0.5 py-0.5 text-[10px]">
              {t('Today')}
              <div className="absolute bottom-full left-1/2 h-0 w-0 -translate-x-1/2 border-x-4 border-b-4 border-x-transparent border-b-neutral-800 text-xs"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default memo(BudgetCard)
