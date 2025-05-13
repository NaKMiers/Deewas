'use client'

import { useAppDispatch, useAppSelector } from '@/hooks/reduxHook'
import { updateCategory } from '@/lib/reducers/categoryReduce'
import { refresh } from '@/lib/reducers/loadReducer'
import { checkTranType, formatCurrency } from '@/lib/string'
import { cn } from '@/lib/utils'
import { ICategory } from '@/models/CategoryModel'
import { deleteCategoryApi } from '@/requests'
import {
  LucideChartPie,
  LucideEllipsisVertical,
  LucideLoaderCircle,
  LucidePencil,
  LucideTrash,
} from 'lucide-react'
import { useTranslations } from 'next-intl'
import { memo, useCallback, useState } from 'react'
import toast from 'react-hot-toast'
import ConfirmDialog from './dialogs/ConfirmDialog'
import CreateBudgetDrawer from './dialogs/CreateBudgetDrawer'
import CreateTransactionDrawer from './dialogs/CreateTransactionDrawer'
import UpdateCategoryDrawer from './dialogs/UpdateCategoryDrawer'
import { Button } from './ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from './ui/dropdown-menu'

// MARK: Category
interface CategoryProps {
  category: ICategory
  hideMenu?: boolean
  className?: string
}

function Category({ category, hideMenu, className }: CategoryProps) {
  // hooks
  const dispatch = useAppDispatch()
  const t = useTranslations('category')

  // store
  const currency = useAppSelector(state => state.settings.settings?.currency)

  // states
  const [updating, setUpdating] = useState<boolean>(false)
  const [deleting, setDeleting] = useState<boolean>(false)

  // values
  const { background, border } = checkTranType(category.type)

  // delete category
  const handleDeleteCategory = useCallback(async () => {
    // start deleting
    setDeleting(true)
    toast.loading(t('Deleting category') + '...', { id: 'delete-category' })

    try {
      const { category: w, message } = await deleteCategoryApi(category._id)
      toast.success(message, { id: 'delete-category' })

      // dispatch(deleteCategory(w))
      dispatch(refresh())
    } catch (err: any) {
      toast.error(err.message, { id: 'delete-category' })
      console.log(err)
    } finally {
      // stop deleting
      setDeleting(false)
    }
  }, [dispatch, category._id, t])

  return (
    <div
      className={cn(
        'border-200/30 relative flex h-10 justify-end overflow-hidden rounded-md bg-primary text-secondary',
        className
      )}
    >
      <div className="w-full max-w-[170px]">
        <div
          className={cn(
            'border-b-[40px] border-l-[40px]',
            border,
            'border-l-transparent border-r-transparent'
          )}
        />
        <div className={cn('h-full w-full', background)} />
      </div>

      <div className="absolute left-0 top-0 flex h-full w-full items-center justify-between gap-2 pl-21/2">
        <div className="relative z-10 flex items-center gap-2">
          <span>{category.icon}</span>
          <p className="text-sm font-semibold">{category.name}</p>
        </div>
        <div className="flex items-center gap-2">
          {currency && (
            <span className="font-body font-bold">{formatCurrency(currency, category.amount)}</span>
          )}

          {!hideMenu && !updating && !deleting ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10 rounded-none hover:bg-primary hover:text-secondary"
                >
                  <LucideEllipsisVertical />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {/* MARK: Create Transaction */}
                {category.type === 'expense' && (
                  <CreateTransactionDrawer
                    initCategory={category}
                    trigger={
                      <Button
                        variant="ghost"
                        className="flex h-8 w-full items-center justify-start gap-2 px-2"
                      >
                        <LucideChartPie size={16} />
                        {t('Add Transaction')}
                      </Button>
                    }
                  />
                )}

                {/* MARK: Set Budget */}
                {category.type === 'expense' && (
                  <CreateBudgetDrawer
                    initCategory={category}
                    trigger={
                      <Button
                        variant="ghost"
                        className="flex h-8 w-full items-center justify-start gap-2 px-2 text-orange-500"
                      >
                        <LucideChartPie size={16} />
                        {t('Set Budget')}
                      </Button>
                    }
                  />
                )}

                {/* MARK: Update */}
                <UpdateCategoryDrawer
                  category={category}
                  update={(category: ICategory) => dispatch(updateCategory(category))}
                  load={setUpdating}
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
                {category.deletable && (
                  <ConfirmDialog
                    label="Delete Wallet"
                    desc="Are you sure you want to delete this wallet?"
                    confirmLabel="Delete"
                    onConfirm={handleDeleteCategory}
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
                )}
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
      </div>
    </div>
  )
}

export default memo(Category)
