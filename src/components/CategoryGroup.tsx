import CreateCategoryDrawer from '@/components/dialogs/CreateCategoryDrawer'
import { Button } from '@/components/ui/button'
import { useAppDispatch } from '@/hooks/reduxHook'
import { addCategory } from '@/lib/reducers/categoryReduce'
import { checkTranType } from '@/lib/string'
import { cn } from '@/lib/utils'
import { ICategory } from '@/models/CategoryModel'
import { TransactionType } from '@/models/TransactionModel'
import { LucideLoaderCircle, LucidePlusSquare } from 'lucide-react'
import { memo, useState } from 'react'
import Category from './Category'
import { TabsContent } from './ui/tabs'

interface CategoryGroupProps {
  categories: ICategory[]
  type: TransactionType
  className?: string
}

function CategoryGroup({ categories, type, className = '' }: CategoryGroupProps) {
  // hooks
  const dispatch = useAppDispatch()

  // states
  const [creating, setCreating] = useState<boolean>(false)

  // values
  const { Icon, border, background } = checkTranType(type)
  categories = categories.sort((a, b) => a.name.localeCompare(b.name))

  return (
    <TabsContent
      value={type}
      className={cn(className)}
    >
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
            update={category => dispatch(addCategory(category))}
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
              <Category
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
    </TabsContent>
  )
}

export default memo(CategoryGroup)
