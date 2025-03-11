'use client'

import CustomInput from '@/components/CustomInput'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { useAppDispatch } from '@/hooks/reduxHook'
import { Link, useRouter } from '@/i18n/navigation'
import { setPageLoading } from '@/lib/reducers/loadReducer'
import { cn } from '@/lib/utils'
import { signIn } from 'next-auth/react'
import { useLocale, useTranslations } from 'next-intl'
import Image from 'next/image'
import { useCallback, useEffect, useState } from 'react'
import { FieldValues, SubmitHandler, useForm } from 'react-hook-form'
import toast from 'react-hot-toast'

function LoginPage() {
  // hooks
  const dispatch = useAppDispatch()
  const router = useRouter()
  const locale = useLocale()
  const t = useTranslations('loginPage')

  // states
  const [isLoading, setIsLoading] = useState<boolean>(false)

  // form
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    clearErrors,
  } = useForm<FieldValues>({
    defaultValues: {
      usernameOrEmail: '',
      password: '',
    },
  })

  // MARK: Login Submission
  const onSubmit: SubmitHandler<FieldValues> = useCallback(
    async data => {
      // start loading
      setIsLoading(true)

      toast.loading(t('Logging in') + '...', { id: 'login' })

      try {
        // send request to server
        const res = await signIn('credentials', { ...data, redirect: false })

        if (res?.ok) {
          // show success message
          toast.success(t('Login Successfully!'), { id: 'login' })

          // redirect to home page
          router.push('/wizard', { locale })
        }

        if (res?.error) {
          // show error message
          toast.error(res.error, { id: 'login' })
          setError('usernameOrEmail', { type: 'manual' })
          setError('password', { type: 'manual' })
        }
      } catch (err: any) {
        toast.error(err.message, { id: 'login' })
        console.log(err)
      } finally {
        // stop loading state
        setIsLoading(false)
      }
    },
    [setError, router, locale, t]
  )

  // keyboard event
  useEffect(() => {
    // set page title
    document.title = t('Login - Deewas')
    dispatch(setPageLoading(false))

    const handleKeydown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        handleSubmit(onSubmit)()
      }
    }

    window.addEventListener('keydown', handleKeydown)

    return () => {
      window.removeEventListener('keydown', handleKeydown)
    }
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
          <h1 className="text-center text-lg font-semibold">{t('Login to Deewas')}</h1>
          <p className="text-center text-sm text-muted-foreground">
            {t('Welcome back, please login to continue!')}
          </p>

          <Separator className="my-8 h-0" />

          {/* MARK: Social Login */}
          <div className="grid grid-cols-1 items-center justify-center gap-2 md:grid-cols-3">
            <Button
              className="h-8 bg-white"
              onClick={() => signIn('google', { callbackUrl: `/${locale}/wizard` })}
            >
              <Image
                src="/icons/google.png"
                width={16}
                height={16}
                alt="Google"
              />
            </Button>
            {/* <Button
              className="h-8 bg-white"
              onClick={() => signIn('apple', { callbackUrl: `/${locale}/wizard` })}
            >
              <Image
                src="/icons/apple.png"
                width={16}
                height={16}
                alt="Google"
              />
            </Button>
            <Button
              className="h-8 bg-white"
              onClick={() => signIn('facebook', { callbackUrl: `/${locale}/wizard` })}
            >
              <Image
                src="/icons/facebook.png"
                width={16}
                height={16}
                alt="Google"
              />
            </Button> */}
          </div>

          <div className="my-6 flex items-center gap-3">
            <div className="h-px w-full border border-neutral-300/30" />{' '}
            <span className="text-sm text-muted-foreground">{t('or')}</span>
            <div className="h-px w-full border border-neutral-300/30" />
          </div>

          <div className="flex flex-col gap-3">
            {/* MARK: Username / Email */}
            <CustomInput
              id="usernameOrEmail"
              label={t('Username / Email')}
              disabled={isLoading}
              register={register}
              errors={errors}
              required
              type="text"
              onFocus={() => clearErrors('usernameOrEmail')}
            />

            {/* MARK: Password */}
            <CustomInput
              id="password"
              label={t('Password')}
              disabled={isLoading}
              register={register}
              errors={errors}
              required
              type="password"
              onFocus={() => clearErrors('password')}
            />
          </div>

          <div className="flex justify-end">
            <Link
              href="/auth/forgot-password"
              className="mt-2 block text-right text-sm underline underline-offset-2"
            >
              {t('Forgot Password?')}
            </Link>
          </div>

          {/* MARK: Submit Button */}
          <Button
            variant="outline"
            className="mt-6 w-full bg-neutral-900 text-white"
            onClick={handleSubmit(onSubmit)}
            disabled={isLoading}
          >
            {t('Login')}
          </Button>
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
export default LoginPage
