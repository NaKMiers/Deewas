'use client'

import CategoryGroup from '@/components/CategoryGroup'
import CreateCategoryDrawer from '@/components/dialogs/CreateCategoryDrawer'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAppDispatch, useAppSelector } from '@/hooks/reduxHook'
import { addCategory, setCategories } from '@/lib/reducers/categoryReduce'
import { cn } from '@/lib/utils'
import { ICategory } from '@/models/CategoryModel'
import { TransactionType } from '@/models/TransactionModel'
import { getMyCategoriesApi } from '@/requests'
import { LucidePlus } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'

function CategoriesPage() {
  // hooks
  const dispatch = useAppDispatch()
  const t = useTranslations('categoriesPage')

  // store
  const { categories } = useAppSelector(state => state.category)

  // states
  const [loading, setLoading] = useState<boolean>(false)
  const [groups, setGroups] = useState<any[]>([])

  // get categories
  useEffect(() => {
    const getCategories = async () => {
      // stat loading
      setLoading(true)

      try {
        const { categories } = await getMyCategoriesApi()
        dispatch(setCategories(categories))
      } catch (err: any) {
        toast.error(t('Failed to get categories'))
        console.error(err)
      } finally {
        // stop loading
        setLoading(false)
      }
    }

    getCategories()
  }, [dispatch, t])

  // auto group categories by type
  useEffect(() => {
    // group categories by type
    const groups = categories.reduce((acc: any, category: any) => {
      if (!acc[category.type]) {
        acc[category.type] = []
      }

      acc[category.type].push(category)

      return acc
    }, {})

    setGroups(Object.entries(groups))
  }, [categories])

  return (
    <div className="md:p-21 container p-21/2 pb-32">
      {/* Top */}
      <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-bold">Categories</h2>
      </div>

      {/* Categories Groups */}
      {!loading ? (
        groups.length > 0 ? (
          <Tabs
            defaultValue={'expense'}
            className="w-full"
          >
            <TabsList className="flex h-12 justify-start overflow-y-auto">
              {groups.map(([key]) => (
                <TabsTrigger
                  value={key}
                  className={cn(
                    'line-clamp-1 h-full w-1/3 min-w-max capitalize',
                    groups.length === 1 ? 'w-full' : groups.length === 2 ? 'w-1/2' : 'w-1/3'
                  )}
                  key={key}
                >
                  {key}
                </TabsTrigger>
              ))}
            </TabsList>
            {groups.map(([type, categories]) => (
              <CategoryGroup
                type={type as TransactionType}
                categories={categories.filter((category: ICategory) => category.type === type)}
                key={type}
              />
            ))}
          </Tabs>
        ) : (
          <div className="flex items-center justify-center rounded-md border border-muted-foreground/50 px-21/2 py-7">
            <p className="text-center text-lg font-semibold text-muted-foreground/50">
              {t("You don't have any categories yet, create one now!")}
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

      {/* Create Category */}
      <CreateCategoryDrawer
        update={category => dispatch(addCategory(category))}
        trigger={
          <Button
            variant="default"
            className="fixed bottom-[calc(78px)] right-2 z-20 h-10 rounded-full"
          >
            <LucidePlus size={24} />
            {t('Create Category')}
          </Button>
        }
      />
    </div>
  )
}

export default CategoriesPage
