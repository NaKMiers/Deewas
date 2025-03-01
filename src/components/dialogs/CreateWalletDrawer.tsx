import { cn } from '@/lib/utils'
import { IWallet } from '@/models/WalletModel'
import { createWalletApi } from '@/requests'
import data from '@emoji-mart/data'
import Picker from '@emoji-mart/react'
import { LucideCircleOff, LucideLoaderCircle } from 'lucide-react'
import { Dispatch, ReactNode, SetStateAction, useCallback, useState } from 'react'
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

interface CreateWalletDialogProps {
  trigger: ReactNode
  update?: (wallet: IWallet) => void
  load?: Dispatch<SetStateAction<boolean>>
  className?: string
}

function CreateWalletDialog({ trigger, update, load, className = '' }: CreateWalletDialogProps) {
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
      name: '',
      icon: '',
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

  // create wallet
  const handleCreateWallet: SubmitHandler<FieldValues> = useCallback(
    async data => {
      // validate form
      if (!handleValidate(data)) return

      // start loading
      setSaving(true)
      if (load) {
        load(true)
      }
      toast.loading('Creating wallet...', { id: 'create-wallet' })

      try {
        const { wallet, message } = await createWalletApi(data)

        console.log('wallet', wallet)

        if (update) {
          update(wallet)
        }

        toast.success(message, { id: 'create-wallet' })
        setOpen(false)
        reset()
      } catch (err: any) {
        toast.error(err.message, { id: 'create-wallet' })
        console.log(err)
      } finally {
        // stop loading
        setSaving(false)
        if (load) {
          load(false)
        }
      }
    },
    [handleValidate, reset, update, load]
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
            <DrawerTitle>Create wallet</DrawerTitle>
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
                    <p className="mt-1 text-xs text-muted-foreground">Click to select</p>
                  </button>
                </DialogTrigger>

                <DialogContent
                  className="touch-auto px-0"
                  onWheelCapture={e => e.stopPropagation()}
                  onTouchMove={e => e.stopPropagation()}
                >
                  <div className="mx-auto flex w-full max-w-sm flex-col items-center px-21/2">
                    <DialogHeader className="mb-21/2">
                      <DialogTitle className="text-center">Select Icon</DialogTitle>
                      <DialogDescription>Icon will be used to represent your wallet</DialogDescription>
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
                This is how your wallet will appear in the app
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
                  Cancel
                </Button>
              </DrawerClose>
              <Button
                variant="default"
                className="h-10 min-w-[60px] rounded-md px-21/2 text-[13px] font-semibold"
                onClick={handleSubmit(handleCreateWallet)}
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

export default CreateWalletDialog
