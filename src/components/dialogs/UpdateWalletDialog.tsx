import { cn } from '@/lib/utils'
import { IWallet } from '@/models/WalletModel'
import { updateWalletApi } from '@/requests'
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

interface UpdateWalletDialogProps {
  trigger: ReactNode
  wallet: IWallet
  update?: (wallet: IWallet) => void
  load?: Dispatch<SetStateAction<boolean>>
  className?: string
}

function UpdateWalletDialog({ wallet, trigger, update, load, className = '' }: UpdateWalletDialogProps) {
  // form
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    setValue,
    clearErrors,
    watch,
    reset,
  } = useForm<FieldValues>({
    defaultValues: {
      name: wallet.name,
      icon: wallet.icon,
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
      if (!data.name) {
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

  // update wallet
  const handleUpdateWallet: SubmitHandler<FieldValues> = useCallback(
    async data => {
      // validate form
      if (!handleValidate(data)) return

      // start loading
      setSaving(true)
      if (load) {
        load(true)
      }
      toast.loading('Updating wallet...', { id: 'update-wallet' })

      try {
        const { wallet: w, message } = await updateWalletApi(wallet._id, data)

        if (update) {
          update(w)
        }

        toast.success(message, { id: 'update-wallet' })
        setOpen(false)
        reset()
      } catch (err: any) {
        toast.error(err.message, { id: 'update-wallet' })
        console.log(err)
      } finally {
        // stop loading
        setSaving(false)
        if (load) {
          load(false)
        }
      }
    },
    [handleValidate, reset, update, load, wallet._id]
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
            <DrawerTitle>Update wallet</DrawerTitle>
            <DrawerDescription>Wallets are used to group your categories</DrawerDescription>
          </DrawerHeader>

          <div className="flex flex-col gap-3">
            <CustomInput
              id="name"
              label="Name"
              disabled={saving}
              register={register}
              errors={errors}
              required
              type="text"
              onFocus={() => clearErrors('name')}
            />

            <div className="mt-3 text-xs">
              <p className="font-semibold">
                Icon <span className="font-normal">(optional)</span>
              </p>

              <Popover>
                <PopoverTrigger className="w-full">
                  <button className="mt-2 flex h-[100px] w-full flex-col items-center justify-center rounded-md bg-neutral-800">
                    {form.icon ? (
                      <span className="block text-[48px] leading-[48px]">{form.icon}</span>
                    ) : (
                      <LucideCircleOff size={48} />
                    )}
                    <p className="mt-1 text-xs text-slate-200">Click to select</p>
                  </button>
                </PopoverTrigger>

                <PopoverContent className="translate-y-[60px] scale-75 rounded-lg p-0 outline-none">
                  <Picker
                    data={data}
                    onEmojiSelect={(emoji: any) => setValue('icon', emoji.native)}
                  />
                </PopoverContent>
              </Popover>
              <p className="mt-2 text-slate-300">This is how your wallet will appear in the app</p>
            </div>
          </div>

          <DrawerFooter className="mb-21 px-0">
            <div className="mt-3 flex items-center justify-end gap-21/2">
              <DrawerClose>
                <Button
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

export default UpdateWalletDialog
