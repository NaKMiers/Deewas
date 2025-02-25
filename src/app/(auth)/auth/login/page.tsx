'use client'

import Input from '@/components/Input'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { useAppDispatch } from '@/hooks/reduxHook'
import { setPageLoading } from '@/lib/reducers/modalReducer'
import { signIn } from 'next-auth/react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'
import { FieldValues, SubmitHandler, useForm } from 'react-hook-form'
import toast from 'react-hot-toast'

function LoginPage() {
  // hooks
  const dispatch = useAppDispatch()
  const router = useRouter()

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

      toast.loading('Logging in...', { id: 'login' })

      try {
        // send request to server
        const res = await signIn('credentials', { ...data, redirect: false })

        if (res?.ok) {
          // show success message
          toast.success('Login Successfully!', { id: 'login' })

          // redirect to home page
          router.push('/')
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
    [setError, router]
  )

  // keyboard event
  useEffect(() => {
    // set page title
    document.title = 'Login - Deewas'
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
  }, [handleSubmit, onSubmit, dispatch])

  return (
    <div className="flex h-screen w-full items-center justify-center p-2">
      <div className="w-full max-w-[400px] overflow-hidden rounded-2xl bg-primary text-secondary">
        <div className="no-scrollbar overflow-y-auto px-10 py-8">
          <h1 className="text-center text-lg font-semibold">Login to Deewas</h1>
          <p className="text-center text-sm text-muted-foreground">
            Welcome back, please login to continue!
          </p>

          <Separator className="my-8" />

          <div className="grid grid-cols-1 items-center justify-center gap-2 md:grid-cols-3">
            <Button
              className="h-8 bg-primary hover:bg-primary/10"
              onClick={() => signIn('google', { callbackUrl: `/` })}
            >
              <Image
                src="/icons/google.png"
                width={16}
                height={16}
                alt="Google"
              />
            </Button>
            <Button
              className="h-8 bg-primary hover:bg-primary/10"
              onClick={() => signIn('apple', { callbackUrl: `/` })}
            >
              <Image
                src="/icons/apple.png"
                width={16}
                height={16}
                alt="Google"
              />
            </Button>
            <Button
              className="h-8 bg-primary hover:bg-primary/10"
              onClick={() => signIn('facebook', { callbackUrl: `/` })}
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
            <span className="text-sm text-muted-foreground">or</span>
            <div className="h-px w-full border border-neutral-300/30" />
          </div>

          <Input
            id="usernameOrEmail"
            label="Username / Email"
            disabled={isLoading}
            register={register}
            errors={errors}
            required
            type="text"
            className=""
            onFocus={() => clearErrors('usernameOrEmail')}
          />

          <Input
            id="password"
            label="Password"
            disabled={isLoading}
            register={register}
            errors={errors}
            required
            type="password"
            className="mt-6 min-w-[40%]"
            onFocus={() => clearErrors('password')}
          />

          <div className="flex justify-end">
            <Link
              href="/auth/forgot-password"
              className="mt-2 block text-right text-sm underline underline-offset-2"
            >
              Forgot password?
            </Link>
          </div>

          <Button
            variant="outline"
            className="mt-5 w-full text-primary"
            onClick={handleSubmit(onSubmit)}
            disabled={isLoading}
          >
            Login
          </Button>
        </div>

        <div className="border-y border-slate-300 bg-neutral-100">
          <p className="px-2 py-5 text-center text-sm">
            Don&apos;t have an account?{' '}
            <Link
              href="/auth/register"
              className="font-semibold underline-offset-1 hover:underline"
            >
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
export default LoginPage
