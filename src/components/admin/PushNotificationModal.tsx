'use client'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import useUtils from '@/hooks/useUtils'
import { shortName } from '@/lib/string'
import { IPushToken } from '@/models/PushTokenModel'
import { IUser } from '@/models/UserModel'
import { deleteUserPushTokenApi, getUserPushTokensApi, sendPushNotificationApi } from '@/requests'
import { LucideRotateCcw } from 'lucide-react'
import { ReactNode, useCallback, useEffect, useState } from 'react'
import { FieldValues, SubmitHandler, useForm } from 'react-hook-form'
import { FaTrash } from 'react-icons/fa'
import { RiDonutChartFill } from 'react-icons/ri'
import { TbRestore } from 'react-icons/tb'
import { toast } from 'sonner'
import CustomInput from '../CustomInput'
import ConfirmDialog from '../dialogs/ConfirmDialog'

interface PushNotificationModalProps {
  user: IUser
  trigger: ReactNode
  className?: string
}

export default function PushNotificationModal({ user, trigger }: PushNotificationModalProps) {
  // hooks
  const { handleCopy } = useUtils()

  // states
  const [open, setOpen] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(false)
  const [sending, setSending] = useState<boolean>(false)
  const [pushTokens, setPushTokens] = useState<IPushToken[]>([])
  const [selectedTokens, setSelectedTokens] = useState<string[]>([])
  const [deletingTokens, setDeletingTokens] = useState<string[]>([])

  // form
  const {
    register,
    setError,
    clearErrors,
    handleSubmit,
    formState: { errors },
  } = useForm<FieldValues>({
    defaultValues: {
      title: `Hello ${shortName(user)}`,
      body: 'How are you doing?',
      subTitle: '',
    },
  })

  // fetch push tokens
  const fetchTokens = useCallback(async () => {
    // start loading
    setLoading(true)

    try {
      const { pushTokens } = await getUserPushTokensApi(user._id)
      setPushTokens(pushTokens)
      setSelectedTokens(pushTokens.map((token: IPushToken) => token.token))
    } catch (err) {
      console.error(err)
      toast.error('Failed to load push tokens')
    } finally {
      // stop loading
      setLoading(false)
    }
  }, [user._id])

  // fetch push tokens when modal opens
  useEffect(() => {
    if (!open || pushTokens.length > 0) return
    fetchTokens()
  }, [fetchTokens, open, pushTokens.length])

  // validate form
  const handleValidate: SubmitHandler<FieldValues> = useCallback(
    data => {
      let isValid = true

      // push tokens are required
      if (selectedTokens.length === 0) {
        toast.error('Please select at least one push token')
        isValid = false
      }

      // title is required
      if (data.title.trim() === '') {
        setError('title', {
          type: 'manual',
          message: 'Title is required',
        })
        isValid = false
      }

      // body is required
      if (data.body.trim() === '') {
        setError('body', {
          type: 'manual',
          message: 'Body is required',
        })
        isValid = false
      }

      return isValid
    },
    [setError, selectedTokens.length]
  )

  // handle send notification
  const handleSend: SubmitHandler<FieldValues> = useCallback(
    async (data: any) => {
      if (!user) return
      if (!handleValidate(data)) return

      // start loading
      setSending(true)

      try {
        const { message } = await sendPushNotificationApi(user._id, selectedTokens, data)
        toast.success(message)
      } catch (err: any) {
        console.log(err)
        toast.error(err.message)
      } finally {
        // stop loading
        setSending(false)
      }
    },
    [handleValidate, user, selectedTokens]
  )

  // handle delete user push token
  const handleDeleteUserPushToken = useCallback(
    async (token: string) => {
      if (!user._id || !token) return

      // start deleting
      setDeletingTokens(prev => [...prev, token])

      try {
        const { message } = await deleteUserPushTokenApi(user._id, token)
        toast.success(message)

        setPushTokens(prev => prev.filter(t => t.token !== token))
        setSelectedTokens(prev => prev.filter(t => t !== token))
        setDeletingTokens(prev => prev.filter(t => t !== token))
      } catch (err: any) {
        console.log(err)
        toast.error(err.message)
      }
    },
    [user._id]
  )

  // toggle token selection
  const toggleToken = (token: string) => {
    setSelectedTokens(prev => (prev.includes(token) ? prev.filter(t => t !== token) : [...prev, token]))
  }

  return (
    <Dialog
      open={open}
      onOpenChange={setOpen}
    >
      <DialogTrigger asChild>{trigger}</DialogTrigger>

      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Send Push Notification</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          {/* MARK: Tokens list */}
          <div>
            <div className="flex items-end justify-between gap-2">
              <p className="text-xs font-semibold">Select Push Tokens</p>
              <button
                className="tran-200 h-6 rounded-md border px-21/2 py-1 hover:opacity-80"
                disabled={loading || sending}
                onClick={fetchTokens}
              >
                {loading ? (
                  <RiDonutChartFill
                    size={14}
                    className="animate-spin"
                  />
                ) : (
                  <LucideRotateCcw size={14} />
                )}
              </button>
            </div>
            <div className="mb mt-2 flex max-h-32 flex-col gap-1 overflow-y-auto rounded-md border px-21 py-21/2">
              {pushTokens.length > 0 ? (
                pushTokens.map(({ _id, token, deviceInfo }) => (
                  <div
                    onClick={() => toggleToken(token)}
                    className="flex cursor-pointer select-none items-start gap-1 py-1"
                    key={_id}
                  >
                    <Checkbox checked={selectedTokens.includes(token)} />
                    <div className="-mt-1 flex-1">
                      <p
                        className="break-all text-sm"
                        onDoubleClick={() => handleCopy(token)}
                      >
                        {token}
                      </p>
                      <p className="text-xs">{`${deviceInfo?.brand || 'unknown brand'} - ${deviceInfo?.modelName || 'unknown model name'} - ${deviceInfo?.osName || 'unknown os'} - ${deviceInfo?.osVersion || 'unknown os version'}`}</p>
                    </div>
                    <ConfirmDialog
                      label={user.isDeleted ? 'Restore User' : 'Delete User'}
                      desc={
                        user.isDeleted
                          ? 'Are you sure that you want to restore this user?'
                          : 'Are you sure that you want to delete this user?'
                      }
                      confirmLabel={user.isDeleted ? 'Restore' : 'Delete'}
                      onConfirm={() => handleDeleteUserPushToken(token)}
                      trigger={
                        <Button
                          variant="ghost"
                          className="h-6 w-6 p-0"
                          onClick={e => e.stopPropagation()}
                          disabled={deletingTokens.includes(token)}
                          title={user.isDeleted ? 'Restore' : 'Delete'}
                        >
                          {deletingTokens.includes(token) ? (
                            <RiDonutChartFill className="animate-spin text-muted-foreground" />
                          ) : (
                            <FaTrash className="text-rose-500" />
                          )}
                        </Button>
                      }
                    />
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No push tokens available</p>
              )}
            </div>
          </div>

          {/* MARK: Title */}
          <CustomInput
            id="title"
            label="Title *"
            disabled={loading || sending}
            register={register}
            errors={errors}
            type="text"
            onFocus={() => clearErrors('title')}
          />

          {/* MARK: Body */}
          <CustomInput
            id="body"
            label="Body *"
            disabled={loading || sending}
            register={register}
            errors={errors}
            type="text"
            onFocus={() => clearErrors('body')}
          />

          {/* MARK: Subtitle */}
          <CustomInput
            id="subtitle"
            label="Subtitle"
            disabled={loading || sending}
            register={register}
            errors={errors}
            type="text"
            onFocus={() => clearErrors('Subtitle')}
          />
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit(handleSend)}
            disabled={loading || sending || selectedTokens.length === 0}
          >
            {sending ? (
              <RiDonutChartFill
                size={24}
                className="animate-spin"
              />
            ) : (
              'Send'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
