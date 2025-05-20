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

function SignInPage() {
  // hooks
  const dispatch = useAppDispatch()
  const router = useRouter()
  const locale = useLocale()
  const t = useTranslations('signInPage')
  const tError = useTranslations('error')

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

  // MARK: Sign In Submission
  const onSubmit: SubmitHandler<FieldValues> = useCallback(
    async data => {
      // start loading
      setIsLoading(true)

      toast.loading(t('Signing in') + '...', { id: 'sign-in' })

      try {
        // send request to server
        const res = await signIn('credentials', { ...data, redirect: false })

        if (res?.ok) {
          // show success message
          toast.success(t('Sign In Successfully!'), { id: 'sign-in' })

          // redirect to home page
          router.push('/', { locale })
        }

        if (res?.error) {
          // show error message
          toast.error(res.error, { id: 'sign-in' })
          setError('usernameOrEmail', {
            type: 'manual',
            message: tError('Invalid username or password'),
          })
          setError('password', {
            type: 'manual',
            message: tError('Invalid username or password'),
          })
        }
      } catch (err: any) {
        toast.error(err.message, { id: 'sign-in' })
        console.log(err)
      } finally {
        // stop loading state
        setIsLoading(false)
      }
    },
    [setError, tError, router, locale, t]
  )

  // keyboard event
  useEffect(() => {
    // set page title
    document.title = t('Sign In - Deewas')
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
    <div className="flex h-screen w-full flex-col items-center justify-center p-2">
      <p className="mb-21 flex flex-row items-end text-center text-4xl font-bold tracking-wider">
        DEEWAS
        <span className="text-[40px] font-bold text-green-500">.</span>
      </p>

      <div
        className={cn(
          'w-full max-w-[400px] overflow-hidden rounded-2xl border border-primary bg-white text-black shadow-md'
        )}
      >
        <div className="no-scrollbar overflow-y-auto px-10 py-8">
          {/* MARK: Header */}
          <h1 className="text-center text-lg font-semibold">{t('Sign In to Deewas')}</h1>
          <p className="text-center text-sm text-muted-foreground">
            {t('Welcome back, please sign in to continue!')}
          </p>

          <Separator className="my-8 h-0" />

          {/* MARK: Social Sign In */}
          <div className="flex items-center justify-center gap-2">
            <Button
              className="trans-200 h-8 flex-1 bg-white hover:bg-black/5"
              onClick={() => signIn('google', { callbackUrl: `/${locale}` })}
            >
              <Image
                src="/icons/google.png"
                width={16}
                height={16}
                alt="Google"
              />

              <p className="ml-1 font-semibold text-black/80">Sign In with Google</p>
            </Button>
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
            {t('Sign In')}
          </Button>
        </div>
      </div>
    </div>
  )
}
export default SignInPage
