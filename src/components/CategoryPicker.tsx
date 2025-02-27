'use client'

import { useAppSelector } from '@/hooks/reduxHook'
import { checkTranType } from '@/lib/string'
import { cn } from '@/lib/utils'
import { ICategory } from '@/models/CategoryModel'
import { TransactionType } from '@/models/TransactionModel'
import { deleteCategoryApi, getMyCategoriesApi } from '@/requests'
import { LucidePlusSquare, LucideX } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { LuChevronsUpDown, LuLoaderCircle } from 'react-icons/lu'
import ConfirmDialog from './dialogs/ConfirmDialog'
import CreateCategoryDialog from './dialogs/CreateCategoryDialog'
import { Button } from './ui/button'
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from './ui/command'
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover'
import { Skeleton } from './ui/skeleton'

interface CategoryPickerProps {
  category?: ICategory
  type: TransactionType
  onChange: (value: string) => void
  isExcept?: boolean
  className?: string
}

function CategoryPicker({ category, type, isExcept, onChange, className = '' }: CategoryPickerProps) {
  // store
  const curWallet: any = useAppSelector(state => state.wallet.curWallet)

  // states
  const [open, setOpen] = useState<boolean>(false)
  const [categories, setCategories] = useState<ICategory[]>([])
  const [selectedCategory, setSelectedCategory] = useState<ICategory | null>(category || null)

  const [getting, setGetting] = useState<boolean>(true)
  const [deleting, setDeleting] = useState<string>('')

  // reset selected category when type changes
  useEffect(() => {
    setSelectedCategory(null)
  }, [type])

  // auto select category when category is passed
  useEffect(() => {
    if (category) setSelectedCategory(category)
  }, [category])

  // get user categories
  const getUserCategories = useCallback(async () => {
    if (!curWallet) return

    // start loading
    setGetting(true)

    try {
      const { categories } = await getMyCategoriesApi(`?walletId=${curWallet._id}`)
      console.log('categories', categories)

      setCategories(categories)
    } catch (err: any) {
      console.error(err)
      toast.error('Failed to get categories')
    } finally {
      // stop loading
      setGetting(false)
    }
  }, [curWallet])

  // initially get user categories
  useEffect(() => {
    getUserCategories()
  }, [getUserCategories])

  // delete category
  const handleDeleteCategory = useCallback(
    async (id: string) => {
      if (!id) return
      // start loading
      setDeleting(id)

      try {
        const { deletedCategory, message } = await deleteCategoryApi(id)

        setCategories(categories.filter(category => category._id !== deletedCategory._id))

        if (selectedCategory?._id === deletedCategory._id) setSelectedCategory(null)
        toast.success(message, { id: 'delete-category' })
      } catch (err: any) {
        toast.error(err.message, { id: 'delete-category' })
        console.log(err)
      } finally {
        // stop loading
        setDeleting('')
      }
    },
    [categories, selectedCategory?._id]
  )

  return (
    <div className={`relative ${className}`}>
      <Popover
        open={open}
        onOpenChange={setOpen}
      >
        <PopoverTrigger asChild>
          {!getting ? (
            <Button
              variant="outline"
              className="w-full justify-between"
              onClick={() => !category && !type && toast.error('Please select type before category')}
            >
              {selectedCategory ? (
                <p>
                  <span>{selectedCategory.icon}</span> {selectedCategory.name}
                </p>
              ) : (
                'Select Category'
              )}{' '}
              <LuChevronsUpDown size={18} />
            </Button>
          ) : (
            <Skeleton className="h-9 rounded-md" />
          )}
        </PopoverTrigger>
        {(!category || isExcept) && type && (
          <PopoverContent className="w-full p-0 shadow-md">
            {/* Search Bar */}
            <Command className="rounded-lg border shadow-md">
              <CommandInput placeholder="Find a category..." />
              {curWallet && (
                <CreateCategoryDialog
                  walletId={curWallet._id}
                  update={category => {
                    setCategories([...categories, category])
                    setSelectedCategory(category)
                    onChange(category._id)
                  }}
                  type={type}
                  trigger={
                    <Button
                      variant="ghost"
                      className="mb-0.5 flex w-full justify-start gap-2 rounded-none text-left text-sm"
                    >
                      <LucidePlusSquare size={18} />
                      Create Category
                    </Button>
                  }
                />
              )}
              <CommandList>
                <CommandEmpty>No results found.</CommandEmpty>
                <CommandSeparator />
                {categories
                  .filter(c => c.type === type)
                  .map(category => (
                    <CommandItem
                      className="justify-between gap-1 rounded-none p-0 py-px"
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
                      <ConfirmDialog
                        label="Delete category"
                        desc={`Are you sure you want to delete ${category.name} category?`}
                        confirmLabel="Delete"
                        cancelLabel="Cancel"
                        onConfirm={() => handleDeleteCategory(category._id)}
                        disabled={deleting === category._id}
                        className="!h-auto !w-auto"
                        trigger={
                          <Button
                            disabled={deleting === category._id}
                            variant="ghost"
                            className="trans-200 h-full flex-shrink-0 rounded-md px-21/2 py-1.5 text-start text-sm font-semibold hover:bg-slate-200/30"
                          >
                            {deleting === category._id ? (
                              <LuLoaderCircle
                                size={16}
                                className="animate-spin text-slate-400"
                              />
                            ) : (
                              <LucideX size={16} />
                            )}
                          </Button>
                        }
                      />
                    </CommandItem>
                  ))}
              </CommandList>
            </Command>
          </PopoverContent>
        )}
      </Popover>
    </div>
  )
}

export default CategoryPicker
