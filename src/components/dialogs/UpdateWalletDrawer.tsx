import { useAppDispatch } from '@/hooks/reduxHook'
import { refresh } from '@/lib/reducers/loadReducer'
import { cn } from '@/lib/utils'
import { IWallet } from '@/models/WalletModel'
import { updateWalletApi } from '@/requests'
import data from '@emoji-mart/data'
import Picker from '@emoji-mart/react'
import { LucideCircleOff, LucideLoaderCircle } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { memo, ReactNode, useCallback, useEffect, useState } from 'react'
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

interface UpdateWalletDrawerProps {
  trigger: ReactNode
  wallet: IWallet
  className?: string
}

function UpdateWalletDrawer({ wallet, trigger, className }: UpdateWalletDrawerProps) {
  // hooks
  const t = useTranslations('updateWalletDrawer')
  const dispatch = useAppDispatch()

  // form
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    setValue,
    clearErrors,
    watch,
  } = useForm<FieldValues>({
    defaultValues: {
      name: wallet.name,
      icon: wallet.icon,
    },
  })

  // states
  const form = watch()
  const [open, setOpen] = useState<boolean>(false)
  const [openEmojiPicker, setOpenEmojiPicker] = useState<boolean>(false)
  const [saving, setSaving] = useState<boolean>(false)

  // auto set wallet after wallet is updated
  useEffect(() => {
    setValue('icon', wallet.icon)
    setValue('name', wallet.name)
  }, [setValue, wallet])

  // validate form
  const handleValidate: SubmitHandler<FieldValues> = useCallback(
    data => {
      let isValid = true

      // name is required
      if (!data.name) {
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

  // update wallet
  const handleUpdateWallet: SubmitHandler<FieldValues> = useCallback(
    async data => {
      // validate form
      if (!handleValidate(data)) return

      // start loading
      setSaving(true)
      toast.loading(t('Updating wallet') + '...', { id: 'update-wallet' })

      try {
        const { message } = await updateWalletApi(wallet._id, data)

        toast.success(message, { id: 'update-wallet' })

        dispatch(refresh())
        setOpen(false)
      } catch (err: any) {
        toast.error(err.message, { id: 'update-wallet' })
        console.log(err)
      } finally {
        // stop loading
        setSaving(false)
      }
    },
    [dispatch, handleValidate, wallet._id, t]
  )

  return (
    <Drawer
      open={open}
      onOpenChange={setOpen}
    >
      <DrawerTrigger asChild>{trigger}</DrawerTrigger>

      <DrawerContent className={cn(className)}>
        <div className="mx-auto w-full max-w-sm px-21/2">
          {/* Header */}
          <DrawerHeader>
            <DrawerTitle className="text-center">{t('Update wallet')}</DrawerTitle>
            <DrawerDescription className="text-center">
              {t('Wallets are used to group your transactions by source of funds')}
            </DrawerDescription>
          </DrawerHeader>

          <div className="flex flex-col gap-3">
            {/* Name */}
            <CustomInput
              id="name"
              label={t('Name')}
              disabled={saving}
              register={register}
              errors={errors}
              required
              type="text"
              onFocus={() => clearErrors('name')}
            />

            {/* MARK: Icon */}
            <div className="mt-3 text-xs">
              <p className="font-semibold">
                Icon <span className="font-normal">({t('optional')})</span>
              </p>

              <Dialog
                open={openEmojiPicker}
                onOpenChange={setOpenEmojiPicker}
              >
                <DialogTrigger className="w-full">
                  <button className="mt-2 flex h-[120px] w-full flex-col items-center justify-center rounded-md border bg-[url(/images/pre-bg-v-flip.png)] bg-cover bg-center bg-no-repeat text-neutral-800">
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
                      <DialogDescription>
                        {t('Icon will be used to represent your wallet')}
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
              <p className="mt-2 text-slate-300">
                {t('This is how your wallet will appear in the app')}
              </p>
            </div>
          </div>

          {/* MARK: Footer */}
          <DrawerFooter className="mb-21 px-0">
            <div className="mt-3 flex items-center justify-end gap-21/2">
              <DrawerClose>
                <Button
                  className="h-10 rounded-md px-21/2 text-[13px] font-semibold"
                  onClick={() => setOpen(false)}
                >
                  {t('Cancel')}
                </Button>
              </DrawerClose>
              <Button
                variant="secondary"
                className="h-10 min-w-[60px] rounded-md px-21/2 text-[13px] font-semibold"
                onClick={handleSubmit(handleUpdateWallet)}
              >
                {saving ? (
                  <LucideLoaderCircle
                    size={20}
                    className="animate-spin text-slate-400"
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

export default memo(UpdateWalletDrawer)
