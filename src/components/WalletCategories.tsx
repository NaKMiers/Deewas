import ConfirmDialog from '@/components/dialogs/ConfirmDialog'
import CreateCategoryDrawer from '@/components/dialogs/CreateCategoryDrawer'
import UpdateCategoryDrawer from '@/components/dialogs/UpdateCategoryDrawer'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { useAppDispatch, useAppSelector } from '@/hooks/reduxHook'
import { setWalletCategories } from '@/lib/reducers/walletReducer'
import { checkTranType, formatCurrency } from '@/lib/string'
import { cn } from '@/lib/utils'
import { ICategory } from '@/models/CategoryModel'
import { TransactionType } from '@/models/TransactionModel'
import { IWallet } from '@/models/WalletModel'
import { deleteCategoryApi } from '@/requests'
import {
  LucideEllipsisVertical,
  LucideLoaderCircle,
  LucidePencil,
  LucidePlusSquare,
  LucideTrash,
} from 'lucide-react'
import { useCallback, useState } from 'react'
import toast from 'react-hot-toast'

interface WalletCategoriesProps {
  wallet: IWallet
  categories: ICategory[]
  type: TransactionType
}

function WalletCategories({ wallet, categories, type }: WalletCategoriesProps) {
  // hooks
  const dispatch = useAppDispatch()

  // store
  const { walletCategories } = useAppSelector(state => state.wallet)

  // states
  const [creating, setCreating] = useState<boolean>(false)

  // values
  const { Icon, border, background } = checkTranType(type)

  // sort by name
  categories = categories.sort((a, b) => a.name.localeCompare(b.name))

  return (
    <div className="rounded-lg border border-neutral-300 bg-secondary text-primary">
      <div className="flex items-center gap-21/2 border-b border-slate-200/30 p-2.5">
        <div
          className={cn(
            'flex h-10 w-10 items-center justify-center rounded-md border-2',
            border,
            background
          )}
        >
          <Icon
            size={24}
            className="text-white"
          />
        </div>
        <div className="flex flex-1 flex-col">
          <p className="text-sm font-semibold capitalize md:text-2xl">{type} Categories</p>
          <p className="text-xs font-semibold text-muted-foreground">Sorted by name</p>
        </div>
        <CreateCategoryDrawer
          type={type}
          update={category => dispatch(setWalletCategories([category, ...walletCategories]))}
          load={setCreating}
          trigger={
            <Button
              disabled={creating}
              variant="default"
              className="flex h-8 flex-shrink-0 items-center gap-1.5 rounded-md px-2 text-xs font-semibold md:px-4"
            >
              {!creating ? (
                <>
                  <LucidePlusSquare />
                  New Category
                </>
              ) : (
                <LucideLoaderCircle className="animate-spin" />
              )}
            </Button>
          }
        />
      </div>

      <div className="flex flex-col gap-1 p-21/2">
        {categories.length > 0 ? (
          categories.map(category => (
            <WalletCategory
              category={category}
              key={category._id}
            />
          ))
        ) : (
          <div className="flex w-full items-center justify-center border-t p-21/2 text-center text-lg font-semibold text-muted-foreground md:p-21">
            No categories found!
          </div>
        )}
      </div>
    </div>
  )
}

export default WalletCategories

// MARK: WalletCategory
interface WalletCategoryProps {
  category: ICategory
  className?: string
}

function WalletCategory({ category, className = '' }: WalletCategoryProps) {
  // hooks
  const dispatch = useAppDispatch()

  // store
  const { walletCategories: categories } = useAppSelector(state => state.wallet)
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
    toast.loading('Deleting category...', { id: 'delete-category' })

    try {
      const { category: w, message } = await deleteCategoryApi(category._id)
      toast.success(message, { id: 'delete-category' })

      dispatch(setWalletCategories(categories.filter((cat: any) => cat._id !== w._id)))
    } catch (err: any) {
      toast.error(err.message, { id: 'delete-category' })
      console.log(err)
    } finally {
      // stop deleting
      setDeleting(false)
    }
  }, [dispatch, categories, category._id])

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
          {!updating && !deleting ? (
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
                <UpdateCategoryDrawer
                  category={category}
                  update={category =>
                    dispatch(
                      setWalletCategories(
                        categories.map((cat: any) => (cat._id === category._id ? category : cat))
                      )
                    )
                  }
                  load={setUpdating}
                  trigger={
                    <Button
                      variant="ghost"
                      className="flex h-8 w-full items-center justify-start gap-2 px-2 text-sky-500"
                    >
                      <LucidePencil size={16} />
                      Edit
                    </Button>
                  }
                />

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
                      Delete
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
      </div>
    </div>
  )
}
