'use client'

import CustomInput from '@/components/CustomInput'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { useAppDispatch } from '@/hooks/reduxHook'
import { Link, useRouter } from '@/i18n/navigation'
import { setPageLoading } from '@/lib/reducers/loadReducer'
import { cn } from '@/lib/utils'
import { resetPasswordApi } from '@/requests'
import { useLocale, useTranslations } from 'next-intl'
import { useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'
import { FieldValues, SubmitHandler, useForm } from 'react-hook-form'
import toast from 'react-hot-toast'

function ResetPasswordPage() {
  // hooks
  const dispatch = useAppDispatch()
  const router = useRouter()
  const locale = useLocale()
  const searchParams = useSearchParams()
  const t = useTranslations('resetPasswordPage')
  const token = searchParams.get('token')

  // states
  const [loading, setLoading] = useState<boolean>(false)

  // form
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setError,
    clearErrors,
  } = useForm<FieldValues>({
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  })

  // validate form
  const handleValidate: SubmitHandler<FieldValues> = useCallback(
    data => {
      let isValid = true

      // password is required
      if (!data.password) {
        setError('password', {
          type: 'manual',
          message: t('Password is required'),
        })
        isValid = false
      }

      // confirm password is required
      if (!data.confirmPassword) {
        setError('confirmPassword', {
          type: 'manual',
          message: t('Confirm password is required'),
        })
        isValid = false
      }

      // password must be at least 6 characters and contain at least 1 lowercase, 1 uppercase, 1 number
      if (data.password && !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/.test(data.password)) {
        setError('password', {
          type: 'manual',
          message: '',
        })
        isValid = false
      }

      // password and confirm password must be the same
      if (data.password && data.confirmPassword && data.password !== data.confirmPassword) {
        setError('confirmPassword', {
          type: 'manual',
          message: t('Passwords do not match'),
        })
        isValid = false
      }

      return isValid
    },
    [setError, t]
  )

  // MARK: Reset Password Submission
  const onSubmit: SubmitHandler<FieldValues> = useCallback(
    async data => {
      if (!token) {
        toast.error(t('Invalid reset link'))
        router.push('/auth/login', { locale })
        return
      }

      if (!handleValidate(data)) return

      setLoading(true)
      toast.loading(t('Resetting password') + '...', { id: 'reset-password' })

      try {
        // send request to server
        const { message } = await resetPasswordApi(token, data.password)

        // show success message
        toast.success(message, { id: 'reset-password' })

        // Redirect to login after successful reset
        setTimeout(() => {
          router.push('/auth/login', { locale })
        }, 2000)
      } catch (err: any) {
        toast.error(err.message, { id: 'reset-password' })
        console.error(err)
      } finally {
        setLoading(false)
      }
    },
    [router, t, token, locale, handleValidate]
  )

  // keyboard event and page setup
  useEffect(() => {
    document.title = t('Reset Password - Deewas')
    dispatch(setPageLoading(false))

    if (!token) {
      toast.error(t('Invalid reset link'))
      router.push('/auth/login', { locale })
    }

    const handleKeydown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        handleSubmit(onSubmit)()
      }
    }

    window.addEventListener('keydown', handleKeydown)
    return () => window.removeEventListener('keydown', handleKeydown)
  }, [handleSubmit, onSubmit, dispatch, t, token, router, locale])

  // Watch password for confirmation matching
  const password = watch('password')

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
            {t('Enter your new password below')}
          </p>

          <Separator className="my-6 h-0" />

          <div className="flex flex-col gap-3">
            <CustomInput
              id="password"
              label={t('New Password')}
              disabled={loading}
              register={register}
              errors={errors}
              type="password"
              onFocus={() => clearErrors('password')}
              validation={{
                minLength: {
                  value: 8,
                  message: t('Password must be at least 8 characters'),
                },
              }}
            />

            {/* MARK: Confirm New Password */}
            <CustomInput
              id="confirmPassword"
              label={t('Confirm New Password')}
              disabled={loading}
              register={register}
              errors={errors}
              type="password"
              onFocus={() => clearErrors('confirmPassword')}
              validation={{
                validate: (value: string) => value === password || t('Passwords do not match'),
              }}
            />
          </div>

          {/* MARK: Submit Button */}
          <Button
            variant="outline"
            className="mt-6 w-full bg-neutral-900 text-white"
            onClick={handleSubmit(onSubmit)}
            disabled={loading}
          >
            {t('Reset Password')}
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

        {/* MARK: Footer */}
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

export default ResetPasswordPage
