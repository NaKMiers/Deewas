'use client'

import CategoryGroup from '@/components/CategoryGroup'
import CreateCategoryDrawer from '@/components/dialogs/CreateCategoryDrawer'
import NoItemsFound from '@/components/NoItemsFound'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAppSelector } from '@/hooks/reduxHook'
import { Link } from '@/i18n/navigation'
import { cn } from '@/lib/utils'
import { ICategory } from '@/models/CategoryModel'
import { TransactionType } from '@/models/TransactionModel'
import { Separator } from '@radix-ui/react-separator'
import { LucideChevronLeft, LucidePlus } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useEffect, useState } from 'react'

function CategoriesPage() {
  // hooks
  const t = useTranslations('categoriesPage')

  // store
  const { categories } = useAppSelector(state => state.category)

  // states
  const [groups, setGroups] = useState<any[]>([])

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

    const order = ['expense', 'income', 'saving', 'invest']
    const results = Object.entries(groups)
      .sort((a, b) => order.indexOf(a[0]) - order.indexOf(b[0]))
      .map(([key, value]) => [key, value])
    setGroups(results)
  }, [categories])

  return (
    <div className="container min-h-[calc(100vh-50px)] p-21/2 md:p-21">
      {/* Top */}
      <div className="flex flex-row flex-wrap items-center gap-21/2">
        <Link
          href="/account"
          className="rounded-full bg-secondary p-1.5"
        >
          <LucideChevronLeft size={22} />
        </Link>
        <p className="pl-1 text-xl font-bold">{t('Categories')}</p>
      </div>

      {/* Categories Groups */}
      {groups.length > 0 ? (
        <Tabs
          defaultValue={'expense'}
          className="mt-21 w-full"
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
        <NoItemsFound
          text={t("You don't have any categories yet, create one now!")}
          className="mt-21"
        />
      )}

      <Separator className="my-36 h-0" />

      {/* MARK: Create Category */}
      <CreateCategoryDrawer
        trigger={
          <Button
            variant="default"
            className="fixed bottom-[calc(78px)] right-2 z-20 h-10 rounded-full xl:right-[calc(50%-640px+21px)]"
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
