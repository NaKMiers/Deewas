'use client'

import CustomInput from '@/components/CustomInput'
import { Button } from '@/components/ui/button'
import { commonEmailMistakes } from '@/constants/mistakes'
import { useAppDispatch } from '@/hooks/reduxHook'
import { Link, useRouter } from '@/i18n/navigation'
import { setPageLoading } from '@/lib/reducers/loadReducer'
import { cn } from '@/lib/utils'
import { registerApi } from '@/requests'
import { Separator } from '@radix-ui/react-context-menu'
import { signIn } from 'next-auth/react'
import { useLocale, useTranslations } from 'next-intl'
import { useTheme } from 'next-themes'
import Image from 'next/image'
import { useCallback, useEffect, useState } from 'react'
import { FieldValues, SubmitHandler, useForm } from 'react-hook-form'
import toast from 'react-hot-toast'

function RegisterPage() {
  // hooks
  const dispatch = useAppDispatch()
  const router = useRouter()
  const locale = useLocale()
  const { setTheme, resolvedTheme } = useTheme()
  const t = useTranslations('registerPage')

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
    shouldFocusError: false,
    defaultValues: {
      username: '',
      email: '',
      password: '',
    },
  })

  // validate form
  const handleValidate: SubmitHandler<FieldValues> = useCallback(
    data => {
      let isValid = true

      // username must be at least 5 characters
      if (data.username.length < 5) {
        setError('username', {
          type: 'manual',
          message: t('Username must be at least 5 characters'),
        })
        isValid = false
      }

      // email must be valid
      if (!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,8}$/.test(data.email)) {
        setError('email', {
          type: 'manual',
          message: t('Invalid email'),
        })
        isValid = false
      } else {
        if (commonEmailMistakes.some(mistake => data.email.toLowerCase().includes(mistake))) {
          setError('email', { message: t('Invalid email') })
          isValid = false
        }
      }

      // password must be at least 6 characters and contain at least 1 lowercase, 1 uppercase, 1 number
      if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/.test(data.password)) {
        setError('password', {
          type: 'manual',
          message: t(
            'Password must be at least 6 characters and contain at least 1 lowercase, 1 uppercase, 1 number'
          ),
        })
        isValid = false
      }

      return isValid
    },
    [setError, t]
  )

  // MARK: Register Submission
  const onSubmit: SubmitHandler<FieldValues> = useCallback(
    async data => {
      // validate form
      if (!handleValidate(data)) return

      // start loading
      setIsLoading(true)

      try {
        // register logic here
        const { user, message } = await registerApi(data)

        // sign in user
        const callback = await signIn('credentials', {
          usernameOrEmail: user.username,
          password: data.password,
          redirect: false,
        })

        if (callback?.error) {
          toast.error(callback.error)
        } else {
          // show success message
          toast.success(message)

          // redirect to home page
          router.push('/wizard', { locale })
        }
      } catch (err: any) {
        // show error message
        console.log(err)
        toast.error(t('Failed to register'))
      } finally {
        // stop loading
        setIsLoading(false)
      }
    },
    [handleValidate, router, locale, t]
  )

  // keyboard event
  useEffect(() => {
    // set page title
    document.title = t('Register - Deewas')
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
          'w-full max-w-[400px] overflow-hidden rounded-2xl border border-primary',
          resolvedTheme === 'dark'
            ? 'border-neutral-800 bg-white text-secondary'
            : 'bg-neutral-50 text-primary'
        )}
      >
        <div className="no-scrollbar overflow-y-auto px-10 py-8">
          <h1
            className="text-center text-lg font-semibold"
            onClick={() => setTheme(resolvedTheme === 'light' ? 'dark' : 'light')}
          >
            {t('Register to Deewas')}
          </h1>
          <p className="text-center text-sm text-muted-foreground">
            {t('Welcome! Please fill in the details to get started')}
          </p>

          <Separator className="my-8" />

          <div className="md:grid-cols-3 grid grid-cols-1 items-center justify-center gap-2">
            <Button
              variant={resolvedTheme === 'light' ? 'outline' : 'default'}
              className="h-8"
              onClick={() => signIn('google', { callbackUrl: `/${locale}/wizard` })}
            >
              <Image
                src="/icons/google.png"
                width={16}
                height={16}
                alt="Google"
              />
            </Button>
            <Button
              variant={resolvedTheme === 'light' ? 'outline' : 'default'}
              className="h-8"
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
              variant={resolvedTheme === 'light' ? 'outline' : 'default'}
              className="h-8"
              onClick={() => signIn('facebook', { callbackUrl: '/wizard' })}
            >
              <Image
                src="/icons/facebook.png"
                width={16}
                height={16}
                alt="Google"
              />
            </Button>
          </div>

          <div className="my-6 flex items-center gap-3">
            <div className="h-px w-full border border-neutral-300/30" />{' '}
            <span className="text-sm text-muted-foreground">{t('or')}</span>
            <div className="h-px w-full border border-neutral-300/30" />
          </div>

          <div className="flex flex-col gap-3">
            <CustomInput
              id="username"
              label={t('Username')}
              disabled={isLoading}
              register={register}
              errors={errors}
              required
              type="text"
              onFocus={() => clearErrors('username')}
            />

            <CustomInput
              id="email"
              label={t('Email')}
              disabled={isLoading}
              register={register}
              errors={errors}
              required
              type="text"
              onFocus={() => clearErrors('email')}
            />

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

          <Button
            variant="default"
            className="mt-6 w-full bg-neutral-900 text-white"
            onClick={handleSubmit(onSubmit)}
            disabled={isLoading}
          >
            {t('Register')}
          </Button>
        </div>

        <div className="border-y border-slate-300 bg-neutral-100">
          <p className="px-2 py-5 text-center text-sm text-black">
            {t('Already have an account?')}{' '}
            <Link
              href="/auth/login"
              className="font-semibold underline-offset-1 hover:underline"
            >
              {t('Login')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
export default RegisterPage
