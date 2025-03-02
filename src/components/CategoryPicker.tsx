'use client'

import { checkTranType } from '@/lib/string'
import { cn } from '@/lib/utils'
import { ICategory } from '@/models/CategoryModel'
import { TransactionType } from '@/models/TransactionModel'
import { deleteCategoryApi, getMyCategoriesApi } from '@/requests'
import { Separator } from '@radix-ui/react-select'
import { LucidePencil, LucidePlusSquare, LucideX } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { LuChevronsUpDown, LuLoaderCircle } from 'react-icons/lu'
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
import { Skeleton } from './ui/skeleton'

interface CategoryPickerProps {
  category?: ICategory
  type: TransactionType
  onChange: (value: string) => void
  isExcept?: boolean
  className?: string
}

function CategoryPicker({ category, type, isExcept, onChange, className = '' }: CategoryPickerProps) {
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
    // start loading
    setGetting(true)

    try {
      const { categories } = await getMyCategoriesApi()

      setCategories(categories)
    } catch (err: any) {
      console.error(err)
      toast.error('Failed to get categories')
    } finally {
      // stop loading
      setGetting(false)
    }
  }, [])

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
        const { category: c, message } = await deleteCategoryApi(id)

        setCategories(categories.filter(category => category._id !== c._id))

        if (selectedCategory?._id === c._id) setSelectedCategory(null)
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
      <Drawer
        open={open}
        onOpenChange={setOpen}
      >
        <DrawerTrigger asChild>
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
        </DrawerTrigger>
        {(!category || isExcept) && type && (
          <DrawerContent className="w-full p-0 shadow-md">
            <div className="mx-auto w-full max-w-sm px-21/2">
              <DrawerHeader>
                <DrawerTitle className="text-center">Select Category</DrawerTitle>
                <DrawerDescription className="text-center">
                  Wallets are used to group your categories
                </DrawerDescription>
              </DrawerHeader>

              {/* Search Bar */}
              <Command className="rounded-lg border shadow-md">
                <CommandInput placeholder="Find a category..." />
                <CreateCategoryDrawer
                  update={category => {
                    // update categories picker list
                    setCategories([...categories, category])
                    setSelectedCategory(category)

                    // update parent component
                    onChange(category._id)

                    // close
                    setOpen(false)
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
                <CommandList>
                  <CommandEmpty>No results found.</CommandEmpty>
                  <CommandSeparator autoFocus={false} />
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

                        {/* Update Category */}
                        {category.deletable && (
                          <UpdateCategoryDrawer
                            category={category}
                            update={(category: ICategory) => {
                              setCategories(categories.map(c => (c._id === category._id ? category : c)))
                            }}
                            trigger={
                              <Button
                                variant="ghost"
                                size="icon"
                              >
                                <LucidePencil />
                              </Button>
                            }
                          />
                        )}

                        {/* Delete Category */}
                        {category.deletable && (
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
                        )}
                      </CommandItem>
                    ))}
                </CommandList>
              </Command>

              <Separator className="my-8" />
            </div>
          </DrawerContent>
        )}
      </Drawer>
    </div>
  )
}

export default CategoryPicker
