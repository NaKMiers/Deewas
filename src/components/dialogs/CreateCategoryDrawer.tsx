import { checkTranType } from '@/lib/string'
import { cn } from '@/lib/utils'
import { ICategory } from '@/models/CategoryModel'
import { TransactionType } from '@/models/TransactionModel'
import { createCategoryApi } from '@/requests'
import data from '@emoji-mart/data'
import Picker from '@emoji-mart/react'
import { LucideCircleOff, LucideLoaderCircle } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Dispatch, memo, ReactNode, SetStateAction, useCallback, useState } from 'react'
import { FieldValues, SubmitHandler, useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import CustomInput from '../CustomInput'
import { Button } from '../ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog'
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

interface CreateCategoryDrawerProps {
  type?: TransactionType
  update?: (category: ICategory) => void
  trigger: ReactNode
  load?: Dispatch<SetStateAction<boolean>>
  className?: string
}

function CreateCategoryDrawer({
  type,
  trigger,
  update,
  load,
  className = '',
}: CreateCategoryDrawerProps) {
  // hooks
  const t = useTranslations('createCategoryDrawer')

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
      name: '',
      icon: '',
      type: type || '',
    },
  })

  // states
  const form = watch()
  const [open, setOpen] = useState<boolean>(false)
  const [openEmojiPicker, setOpenEmojiPicker] = useState<boolean>(false)
  const [saving, setSaving] = useState<boolean>(false)

  // validate form
  const handleValidate: SubmitHandler<FieldValues> = useCallback(
    data => {
      let isValid = true

      // name is required
      if (!data.name.trim()) {
        setError('name', {
          type: 'manual',
          message: t('Name is required'),
        })
        isValid = false
      }

      return isValid
    },
    [setError, t]
  )

  // create category
  const handleCreateCategory: SubmitHandler<FieldValues> = useCallback(
    async data => {
      // validate form
      if (!handleValidate(data)) return

      // start loading
      setSaving(true)
      if (load) {
        load(true)
      }
      toast.loading(t('Creating category') + '...', { id: 'create-category' })

      try {
        const { category, message } = await createCategoryApi({ ...data })

        if (update) {
          update(category)
        }

        toast.success(message, { id: 'create-category' })
        setOpen(false)
        reset()
      } catch (err: any) {
        toast.error(err.message, { id: 'create-category' })
        console.log(err)
      } finally {
        // stop loading
        setSaving(false)
        if (load) {
          load(false)
        }
      }
    },
    [handleValidate, load, reset, update, t]
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
            <DrawerTitle className="text-center">
              {t('Create')}{' '}
              {form.type && <span className={cn(checkTranType(form.type).color)}>{t(form.type)}</span>}{' '}
              {t('category')}
            </DrawerTitle>
            <DrawerDescription className="text-center">
              {t('Categories are used to group your')}{' '}
              {form.type && <span className={cn(checkTranType(form.type).color)}>{t(form.type)}</span>}{' '}
              {t('transactions')}
            </DrawerDescription>
          </DrawerHeader>

          <div className="flex flex-col gap-3">
            <CustomInput
              id="name"
              label={t('Name')}
              disabled={saving}
              register={register}
              errors={errors}
              type="text"
              onFocus={() => clearErrors('name')}
            />

            {!type && (
              <CustomInput
                id="type"
                label={t('Type')}
                disabled={saving}
                register={register}
                errors={errors}
                type="select"
                control={control}
                options={[
                  {
                    label: t('Expense'),
                    value: 'expense',
                  },
                  {
                    label: t('Income'),
                    value: 'income',
                  },
                  {
                    label: t('Saving'),
                    value: 'saving',
                  },
                  {
                    label: t('Invest'),
                    value: 'invest',
                  },
                ]}
                onFocus={() => clearErrors('type')}
              />
            )}

            <div className="mt-3 text-xs">
              <p className="font-semibold">
                Icon <span className="font-normal">({t('optional')})</span>
              </p>

              <Dialog
                open={openEmojiPicker}
                onOpenChange={setOpenEmojiPicker}
              >
                <DialogTrigger className="w-full">
                  <button className="mt-2 flex h-[100px] w-full flex-col items-center justify-center rounded-md border">
                    {form.icon ? (
                      <span className="block text-[48px] leading-[48px]">{form.icon}</span>
                    ) : (
                      <LucideCircleOff size={48} />
                    )}
                    <p className="mt-1 text-xs text-muted-foreground">{t('Click to select')}</p>
                  </button>
                </DialogTrigger>

                <DialogContent
                  className="touch-auto px-0"
                  onWheelCapture={e => e.stopPropagation()}
                  onTouchMove={e => e.stopPropagation()}
                >
                  <div className="mx-auto flex w-full max-w-sm flex-col items-center px-21/2">
                    <DialogHeader className="mb-21/2">
                      <DialogTitle className="text-center">{t('Select Icon')}</DialogTitle>
                      <DialogDescription className="text-center">
                        {t('Icon will be used to represent your category')}
                      </DialogDescription>
                    </DialogHeader>

                    <Picker
                      data={data}
                      onEmojiSelect={(emoji: any) => {
                        setValue('icon', emoji.native)
                        setOpenEmojiPicker(false)
                      }}
                    />
                  </div>
                </DialogContent>
              </Dialog>

              <p className="mt-2 text-muted-foreground">
                {t('This is how your category will appear in the app')}
              </p>
            </div>
          </div>

          <DrawerFooter className="mb-21 px-0">
            <div className="mt-3 flex items-center justify-end gap-21/2">
              <DrawerClose>
                <Button
                  variant="secondary"
                  className="h-10 rounded-md px-21/2 text-[13px] font-semibold"
                  onClick={() => {
                    setOpen(false)
                    reset()
                  }}
                >
                  {t('Cancel')}
                </Button>
              </DrawerClose>
              <Button
                variant="default"
                className="h-10 min-w-[60px] rounded-md px-21/2 text-[13px] font-semibold"
                onClick={handleSubmit(handleCreateCategory)}
              >
                {saving ? (
                  <LucideLoaderCircle
                    size={20}
                    className="animate-spin text-muted-foreground"
                  />
                ) : (
                  t('Save')
                )}
              </Button>
            </div>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  )
}

export default memo(CreateCategoryDrawer)
