import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { toUTC } from '@/lib/time'
import { cn } from '@/lib/utils'
import { IUser } from '@/models/UserModel'
import { updatePlanApi } from '@/requests'
import moment from 'moment-timezone'
import { memo, ReactNode, useCallback, useState } from 'react'
import { FieldValues, SubmitHandler, useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { RiDonutChartFill } from 'react-icons/ri'
import CustomInput from '../CustomInput'
import { Button } from '../ui/button'

interface UpgradePlanModalProps {
  user: IUser
  updateUser?: (user: IUser) => void
  trigger: ReactNode
  className?: string
}

function UpgradePlanModal({ user, trigger, updateUser, className }: UpgradePlanModalProps) {
  const [open, setOpen] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(false)

  const {
    register,
    formState: { errors },
    control,
    setValue,
    clearErrors,
    handleSubmit,
    watch,
  } = useForm<FieldValues>({
    defaultValues: {
      plan: user.plan || 'free',
      planExpiredAt: user.planExpiredAt ? moment(user.planExpiredAt).format('YYYY-MM-DDTHH:mm') : '',
      purchasedAtPlatform: user.purchasedAtPlatform || 'ios',
    },
  })
  const form = watch()

  // handle submit filter
  const handleUpdatePlan: SubmitHandler<FieldValues> = useCallback(
    async data => {
      setLoading(true)

      try {
        const { user: u, message } = await updatePlanApi(user._id, {
          ...data,
          planExpiredAt: data.planExpiredAt ? toUTC(moment(data.planExpiredAt).toDate()) : null,
        })

        if (updateUser) updateUser(u)

        toast.success(message)
        setOpen(false)
      } catch (err: any) {
        console.log(err)
        toast.error(err.message)
      } finally {
        setLoading(false)
      }
    },
    [user._id, updateUser]
  )

  return (
    <Popover
      open={open}
      onOpenChange={open => setOpen(open)}
    >
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      <PopoverContent
        className={cn('w-80', className)}
        onClick={e => e.stopPropagation()}
      >
        <h4 className="font-medium leading-none">Upgrade Plan</h4>

        <div className="mt-3 flex flex-col gap-21/2">
          {/* Plan */}
          <CustomInput
            id="plan"
            label="Plan"
            disabled={false}
            register={register}
            errors={errors}
            control={control}
            type="select"
            onFocus={() => clearErrors('plan')}
            output={(value: string) => {
              if (value === 'premium-monthly') {
                setValue('planExpiredAt', moment().add(1, 'month').format('YYYY-MM-DDTHH:mm'))
              } else if (value === 'premium-yearly') {
                setValue('planExpiredAt', moment().add(1, 'year').format('YYYY-MM-DDTHH:mm'))
              } else {
                setValue('planExpiredAt', '')
              }
            }}
            options={[
              {
                value: 'free',
                label: 'Free',
              },
              {
                value: 'premium-monthly',
                label: 'Monthly Premium',
              },
              {
                value: 'premium-yearly',
                label: 'Yearly Premium',
              },
              {
                value: 'premium-lifetime',
                label: 'Lifetime Premium',
              },
            ]}
          />

          {/* Plan Expired At */}
          <CustomInput
            id="planExpiredAt"
            label="Expired At"
            disabled={form.plan === 'free' || form.plan === 'lifetime-premium'}
            register={register}
            errors={errors}
            control={control}
            type="datetime-local"
            onFocus={() => clearErrors('planExpiredAt')}
          />

          {/* Purchased At Platform */}
          <CustomInput
            id="purchasedAtPlatform"
            label="Platform"
            disabled={false}
            register={register}
            errors={errors}
            control={control}
            type="select"
            onFocus={() => clearErrors('purchasedAtPlatform')}
            options={[
              {
                value: 'ios',
                label: 'IOS',
              },
              {
                value: 'android',
                label: 'Android',
              },
            ]}
          />

          <div className="mt-2 flex justify-end">
            <Button
              variant="default"
              onClick={handleSubmit(handleUpdatePlan)}
            >
              {loading ? (
                <RiDonutChartFill
                  size={24}
                  className="animate-spin"
                />
              ) : (
                'Upgrade'
              )}
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}

export default memo(UpgradePlanModal)
