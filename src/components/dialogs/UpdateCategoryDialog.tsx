import { checkTranType } from '@/lib/string'
import { cn } from '@/lib/utils'
import { ICategory } from '@/models/CategoryModel'
import { updateCategoryApi } from '@/requests'
import data from '@emoji-mart/data'
import Picker from '@emoji-mart/react'
import { LucideCircleOff, LucideLoaderCircle } from 'lucide-react'
import { Dispatch, ReactNode, SetStateAction, useCallback, useState } from 'react'
import { FieldValues, SubmitHandler, useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import CustomInput from '../CustomInput'
import { Button } from '../ui/button'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '../ui/drawer'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover'

interface UpdateCategoryDialogProps {
  category: ICategory
  trigger: ReactNode
  update?: (category: ICategory) => void
  load?: Dispatch<SetStateAction<boolean>>
  className?: string
}

function UpdateCategoryDialog({
  category,
  trigger,
  update,
  load,
  className = '',
}: UpdateCategoryDialogProps) {
  // form
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    setValue,
    control,
    clearErrors,
    watch,
    reset,
  } = useForm<FieldValues>({
    defaultValues: {
      name: category.name || '',
      icon: category.icon || '',
      type: category.type || '',
    },
  })

  // states
  const form = watch()
  const [open, setOpen] = useState<boolean>(false)
  const [saving, setSaving] = useState<boolean>(false)

  // validate form
  const handleValidate: SubmitHandler<FieldValues> = useCallback(
    data => {
      let isValid = true

      // name is required
      if (!data.name.trim()) {
        setError('name', {
          type: 'manual',
          message: 'Name is required',
        })
        isValid = false
      }

      return isValid
    },
    [setError]
  )

  // update category
  const handleUpdateCategory: SubmitHandler<FieldValues> = useCallback(
    async data => {
      // validate form
      if (!handleValidate(data)) return
      // start loading
      setSaving(true)
      if (load) {
        load(true)
      }
      toast.loading('Updating category...', { id: 'update-category' })

      try {
        const { category: c, message } = await updateCategoryApi(category._id, { ...data })

        if (update) {
          update(c)
        }

        toast.success(message, { id: 'update-category' })
        setOpen(false)
        reset()
      } catch (err: any) {
        toast.error(err.message, { id: 'update-category' })
        console.log(err)
      } finally {
        // stop loading
        setSaving(false)
        if (load) {
          load(false)
        }
      }
    },
    [handleValidate, load, reset, update, category._id]
  )

  return (
    <Drawer
      open={open}
      onOpenChange={setOpen}
    >
      <DrawerTrigger asChild>{trigger}</DrawerTrigger>

      <DrawerContent className={cn(className)}>
        <div className="mx-auto w-full max-w-sm px-21/2">
          <DrawerHeader>
            <DrawerTitle>
              Update{' '}
              {form.type && <span className={cn(checkTranType(form.type).color)}>{form.type}</span>}{' '}
              category
            </DrawerTitle>
            <DrawerDescription>
              Categories are used to group your{' '}
              {form.type && <span className={cn(checkTranType(form.type).color)}>{form.type}</span>}{' '}
              transactions
            </DrawerDescription>
          </DrawerHeader>

          <div className="flex flex-col gap-3">
            <CustomInput
              id="name"
              label="Name"
              disabled={saving}
              register={register}
              errors={errors}
              type="text"
              onFocus={() => clearErrors('name')}
            />

            <CustomInput
              id="type"
              label="Type"
              disabled={saving}
              register={register}
              errors={errors}
              type="select"
              control={control}
              options={[
                {
                  label: 'Expense',
                  value: 'expense',
                },
                {
                  label: 'Income',
                  value: 'income',
                },
                {
                  label: 'Saving',
                  value: 'saving',
                },
                {
                  label: 'Invest',
                  value: 'invest',
                },
              ]}
              onFocus={() => clearErrors('type')}
            />
            <p className="-mt-2 pl-1 text-xs italic text-muted-foreground text-yellow-400">
              When you change type, all transaction&apos;s type of this category will be changed!
            </p>

            <div className="mt-3 text-xs">
              <p className="font-semibold">
                Icon <span className="font-normal">(optional)</span>
              </p>

              <Popover>
                <PopoverTrigger className="w-full">
                  <button className="mt-2 flex h-[100px] w-full flex-col items-center justify-center rounded-md border">
                    {form.icon ? (
                      <span className="block text-[48px] leading-[48px]">{form.icon}</span>
                    ) : (
                      <LucideCircleOff size={48} />
                    )}
                    <p className="mt-1 text-xs text-muted-foreground">Click to select</p>
                  </button>
                </PopoverTrigger>

                <PopoverContent className="translate-y-[60px] scale-75 rounded-lg p-0 outline-none">
                  <Picker
                    data={data}
                    onEmojiSelect={(emoji: any) => setValue('icon', emoji.native)}
                  />
                </PopoverContent>
              </Popover>
              <p className="mt-2 text-muted-foreground">
                This is how your category will appear in the app
              </p>
            </div>
          </div>

          <DrawerFooter className="mb-21 px-0">
            <div className="mx-auto w-full max-w-sm px-21/2">
              <DrawerClose>
                <Button
                  variant="secondary"
                  className="h-10 rounded-md px-21/2 text-[13px] font-semibold"
                  onClick={() => {
                    setOpen(false)
                    reset()
                  }}
                >
                  Cancel
                </Button>
              </DrawerClose>
              <Button
                variant="default"
                className="h-10 min-w-[60px] rounded-md px-21/2 text-[13px] font-semibold"
                onClick={handleSubmit(handleUpdateCategory)}
              >
                {saving ? (
                  <LucideLoaderCircle
                    size={20}
                    className="animate-spin text-muted-foreground"
                  />
                ) : (
                  'Save'
                )}
              </Button>
            </div>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  )
}

export default UpdateCategoryDialog
