'use client'

import { useAppDispatch, useAppSelector } from '@/hooks/reduxHook'
import { refresh } from '@/lib/reducers/loadReducer'
import { checkTranType } from '@/lib/string'
import { cn } from '@/lib/utils'
import { ICategory } from '@/models/CategoryModel'
import { TransactionType } from '@/models/TransactionModel'
import { deleteCategoryApi } from '@/requests'
import { LucidePencil, LucidePlusSquare } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { memo, useCallback, useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { LuChevronsUpDown, LuLoaderCircle, LuTrash } from 'react-icons/lu'
import ConfirmDialog from './dialogs/ConfirmDialog'
import CreateCategoryDrawer from './dialogs/CreateCategoryDrawer'
import UpdateCategoryDrawer from './dialogs/UpdateCategoryDrawer'
import { Button } from './ui/button'
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from './ui/command'
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from './ui/drawer'
import { Separator } from './ui/separator'

interface CategoryPickerProps {
  category?: ICategory
  type: TransactionType
  onChange: (value: string) => void
  className?: string
}

function CategoryPicker({ category, type, onChange, className }: CategoryPickerProps) {
  // hooks
  const t = useTranslations('categoryPicker')
  const dispatch = useAppDispatch()

  // store
  let categories = useAppSelector(state => state.category.categories)
  categories = categories
    .filter(c => c.type === type)
    .sort((a, b) => (a.deletable === b.deletable ? 0 : a.deletable ? -1 : 1))

  // states
  const [open, setOpen] = useState<boolean>(false)
  const [selectedCategory, setSelectedCategory] = useState<ICategory | null>(category || null)
  const [deleting, setDeleting] = useState<string>('')

  // reset selected category when type changes
  useEffect(() => {
    setSelectedCategory(null)
  }, [type])

  // auto select category when category is passed
  useEffect(() => {
    if (category) setSelectedCategory(category)
  }, [category])

  // delete category
  const handleDeleteCategory = useCallback(
    async (id: string) => {
      if (!id) return
      // start loading
      setDeleting(id)

      try {
        const { category: c, message } = await deleteCategoryApi(id)

        if (selectedCategory?._id === c._id) setSelectedCategory(null)

        toast.success(message, { id: 'delete-category' })

        dispatch(refresh())
      } catch (err: any) {
        toast.error(err.message, { id: 'delete-category' })
        console.log(err)
      } finally {
        // stop loading
        setDeleting('')
      }
    },
    [dispatch, selectedCategory?._id]
  )

  return (
    <div className={`relative ${className}`}>
      <Drawer
        open={open}
        onOpenChange={setOpen}
      >
        <DrawerTrigger asChild>
          <Button
            className="w-full justify-between"
            onClick={() => !category && !type && toast.error('Please select type before category')}
          >
            {selectedCategory ? (
              <p>
                <span>{selectedCategory.icon}</span> {selectedCategory.name}
              </p>
            ) : (
              t('Select category')
            )}
            <LuChevronsUpDown size={18} />
          </Button>
        </DrawerTrigger>
        <DrawerContent className="w-full p-0 shadow-md">
          <div className="mx-auto w-full max-w-sm px-21/2">
            <DrawerHeader>
              <DrawerTitle className="text-center">{t('Select category')}</DrawerTitle>
              <DrawerDescription className="text-center">
                {t('Categories are used to group your transactions')}
              </DrawerDescription>
            </DrawerHeader>

            {/* Search Bar */}
            <Command className="rounded-lg border shadow-md">
              <CommandInput
                autoFocus={false}
                className="text-base md:text-sm"
                placeholder={t('Find a category') + '...'}
              />

              {/* MARK: Create Category */}
              <CreateCategoryDrawer
                type={type}
                trigger={
                  <Button
                    variant="ghost"
                    className="mb-0.5 flex w-full justify-start gap-2 rounded-none text-left text-sm"
                  >
                    <LucidePlusSquare size={18} />
                    {t('Create Category')}
                  </Button>
                }
              />
              <CommandList>
                <CommandEmpty>{t('No results found')}.</CommandEmpty>
                <CommandSeparator />
                {categories
                  .filter(c => c.type === type)
                  .map(category => (
                    <CommandItem
                      className="justify-between gap-1 rounded-none p-0 pr-21/2"
                      key={category._id}
                    >
                      <Button
                        variant="ghost"
                        className={cn(
                          'w-full justify-start rounded-none border-l-[3px]',
                          checkTranType(category.type).border
                        )}
                        onClick={() => {
                          setOpen(false)
                          setSelectedCategory(category)
                          onChange(category._id)
                        }}
                        disabled={false}
                      >
                        <span>{category.icon}</span> {category.name}
                      </Button>

                      {/* MARK: Update Category */}
                      {category.deletable && (
                        <UpdateCategoryDrawer
                          category={category}
                          trigger={
                            <Button
                              variant="ghost"
                              size="icon"
                              className="0 h-7 p-1.5 hover:bg-transparent"
                            >
                              <LucidePencil />
                            </Button>
                          }
                        />
                      )}

                      {/* MARK: Delete Category */}
                      {category.deletable && (
                        <ConfirmDialog
                          label={t('Delete category')}
                          desc={`${t('All budgets of this category will be deleted')}. ${t('Are you sure you want to delete this category?')}`}
                          confirmLabel={t('Delete')}
                          cancelLabel={t('Cancel')}
                          onConfirm={() => handleDeleteCategory(category._id)}
                          disabled={deleting === category._id}
                          className="!h-auto !w-auto"
                          trigger={
                            <Button
                              disabled={deleting === category._id}
                              variant="ghost"
                              className="0 h-7 p-1.5 hover:bg-transparent"
                            >
                              {deleting === category._id ? (
                                <LuLoaderCircle
                                  size={16}
                                  className="animate-spin text-slate-400"
                                />
                              ) : (
                                <LuTrash size={16} />
                              )}
                            </Button>
                          }
                        />
                      )}
                    </CommandItem>
                  ))}
              </CommandList>
            </Command>

            <Separator className="my-8" />
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  )
}

export default memo(CategoryPicker)
