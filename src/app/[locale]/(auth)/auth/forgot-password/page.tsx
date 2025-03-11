'use client'

import CustomInput from '@/components/CustomInput'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { useAppDispatch } from '@/hooks/reduxHook'
import { Link } from '@/i18n/navigation'
import { setPageLoading } from '@/lib/reducers/loadReducer'
import { cn } from '@/lib/utils'
import { forgotPasswordApi } from '@/requests'
import { useTranslations } from 'next-intl'
import { useCallback, useEffect, useState } from 'react'
import { FieldValues, SubmitHandler, useForm } from 'react-hook-form'
import toast from 'react-hot-toast'

function ForgotPasswordPage() {
  // hooks
  const dispatch = useAppDispatch()
  const t = useTranslations('forgotPasswordPage')

  // states
  const [loading, setLoading] = useState<boolean>(false)

  // form
  const {
    register,
    handleSubmit,
    formState: { errors },
    clearErrors,
  } = useForm<FieldValues>({
    defaultValues: {
      email: '',
    },
  })

  // MARK: Forgot Password Submission
  const onSubmit: SubmitHandler<FieldValues> = useCallback(
    async data => {
      setLoading(true)
      toast.loading(t('Sending reset link') + '...', { id: 'forgot-password' })

      try {
        // send request to server
        const { message } = await forgotPasswordApi(data)

        // show success message
        toast.success(message, { id: 'forgot-password' })
      } catch (err: any) {
        toast.error(err.message, { id: 'forgot-password' })
        console.error(err)
      } finally {
        // stop loading
        setLoading(false)
      }
    },
    [setLoading, t]
  )

  // keyboard event and page setup
  useEffect(() => {
    document.title = t('Forgot Password - Deewas')
    dispatch(setPageLoading(false))

    const handleKeydown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        handleSubmit(onSubmit)()
      }
    }

    window.addEventListener('keydown', handleKeydown)
    return () => window.removeEventListener('keydown', handleKeydown)
  }, [handleSubmit, onSubmit, dispatch, t])

  return (
    <div className="flex h-screen w-full items-center justify-center p-2">
      <div
        className={cn(
          'w-full max-w-[400px] overflow-hidden rounded-2xl border border-primary bg-white text-black'
        )}
      >
        <div className="no-scrollbar overflow-y-auto px-10 py-8">
          {/* MARK: Header */}
          <h1 className="text-center text-lg font-semibold">{t('Reset Your Password')}</h1>
          <p className="text-center text-sm text-muted-foreground">
            {t('Enter your email to receive a password reset link')}
          </p>

          <Separator className="my-6 h-0" />

          <div className="flex flex-col gap-3">
            <CustomInput
              id="email"
              label={t('Email')}
              disabled={loading}
              register={register}
              errors={errors}
              required
              type="email"
              onFocus={() => clearErrors('email')}
            />
          </div>

          <Button
            variant="outline"
            className="mt-6 w-full bg-neutral-900 text-white"
            onClick={handleSubmit(onSubmit)}
            disabled={loading}
          >
            {t('Send Reset Link')}
          </Button>

          <div className="mt-4 text-center">
            <Link
              href="/auth/login"
              className="text-sm text-muted-foreground underline underline-offset-2 hover:text-black"
            >
              {t('Back to Login')}
            </Link>
          </div>
        </div>

        <div className="border-y border-slate-300 bg-neutral-100">
          <p className="px-2 py-5 text-center text-sm text-black">
            {t("Don't have an account?")}{' '}
            <Link
              href="/auth/register"
              className="font-semibold underline-offset-1 hover:underline"
            >
              {t('Register')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default ForgotPasswordPage
