import { cn } from '@/lib/utils'
import { IWallet } from '@/models/WalletModel'
import { createWalletApi } from '@/requests'
import data from '@emoji-mart/data'
import Picker from '@emoji-mart/react'
import { DialogClose } from '@radix-ui/react-dialog'
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover'

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
    <Dialog
      open={open}
      onOpenChange={setOpen}
    >
      <DialogTrigger asChild>{trigger}</DialogTrigger>

      <DialogContent className={cn('rounded-lg border-slate-200/30 sm:max-w-[425px]', className)}>
        <DialogHeader className="text-start">
          <DialogTitle className="font-semibold">Create wallet</DialogTitle>
          <DialogDescription>Wallets are used to group your categories</DialogDescription>
        </DialogHeader>

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
            <p className="mt-2 text-muted-foreground">This is how your wallet will appear in the app</p>
          </div>
        </div>

        <DialogFooter>
          <div className="mt-3 flex items-center justify-end gap-21/2">
            <DialogClose>
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
            </DialogClose>
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
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default CreateWalletDialog
