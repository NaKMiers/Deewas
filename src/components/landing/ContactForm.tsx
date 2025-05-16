'use client'

import { commonEmailMistakes } from '@/constants/mistakes'
import { cn } from '@/lib/utils'
import { sendSupportFormApi } from '@/requests'
import { useTranslations } from 'next-intl'
import { useCallback, useState } from 'react'
import { FieldValues, SubmitHandler, useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { LuLoaderCircle } from 'react-icons/lu'
import CustomInput from '../CustomInput'

interface ContactFormProps {
  subTitle: string
  title: string
  className?: string
}

function ContactForm({ subTitle, title, className }: ContactFormProps) {
  // hooks
  const t = useTranslations('contactForm')

  // states
  const [loading, setLoading] = useState<boolean>(false)

  // form
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    clearErrors,
    reset,
  } = useForm<FieldValues>({
    defaultValues: {
      name: '',
      email: '',
      subject: '',
      message: '',
    },
  })

  // validate form
  const validate: SubmitHandler<FieldValues> = useCallback(
    data => {
      let isValid = true

      // name is required
      if (!data.name.trim()) {
        setError('name', {
          type: 'manual',
          message: t('Name is required'),
        })
        isValid = false
      }

      // email is required
      if (!data.email.trim()) {
        setError('email', {
          type: 'manual',
          message: t('Email is required'),
        })
        isValid = false
      } else if (!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(data.email)) {
        setError('email', {
          type: 'manual',
          message: t('Email is invalid'),
        })
        isValid = false
      } else {
        if (commonEmailMistakes.some(mistake => data.email.toLowerCase().includes(mistake))) {
          setError('email', {
            type: 'manual',
            message: t('Email is invalid'),
          })
          isValid = false
        }
      }

      // subject is required
      if (!data.subject.trim()) {
        setError('subject', {
          type: 'manual',
          message: t('Subject is required'),
        })
        isValid = false
      }

      // message is required
      if (!data.message.trim()) {
        setError('message', {
          type: 'manual',
          message: t('Message is required'),
        })
        isValid = false
      }

      return isValid
    },
    [setError, t]
  )
  // MARK: Send support form
  const sendMessage: SubmitHandler<FieldValues> = useCallback(
    async data => {
      if (!validate(data)) return

      setLoading(true)

      try {
        // send request to server
        await sendSupportFormApi(data)
        toast.success('Sent message', { id: 'support-message' })

        reset()
      } catch (err: any) {
        toast.error(err.message, { id: 'support-message' })
        console.error(err)
      } finally {
        // stop loading
        setLoading(false)
      }
    },
    [validate, reset]
  )

  return (
    <div
      className={cn(
        'w-full rounded-xl border border-primary/10 bg-primary p-21 text-secondary',
        className
      )}
    >
      <h6 className="font-body font-semibold uppercase tracking-widest text-sky-500">{subTitle}</h6>
      <h4 className="mt-3 max-w-sm text-3xl font-semibold">{title}</h4>

      <div className="mt-21/2 flex flex-col gap-21/2">
        <CustomInput
          id="name"
          label={t('Your name')}
          disabled={loading}
          register={register}
          errors={errors}
          type="text"
          onFocus={() => clearErrors('name')}
        />

        <CustomInput
          id="email"
          label={t('Your email')}
          disabled={loading}
          register={register}
          errors={errors}
          type="email"
          onFocus={() => clearErrors('email')}
        />

        <CustomInput
          id="subject"
          label={t('Subject')}
          disabled={loading}
          register={register}
          errors={errors}
          type="email"
          onFocus={() => clearErrors('subject')}
        />

        <div onFocus={() => clearErrors('message')}>
          <label
            htmlFor="message"
            className={cn('ml-1 text-xs font-semibold', errors['message'] ? 'text-rose-500' : '')}
          >
            {t('Message')}
          </label>
          <textarea
            id="message"
            className={cn(
              'mt-0.5 block w-full rounded-lg border bg-transparent px-2.5 py-1 md:text-sm',
              errors['message'] && 'border-rose-500'
            )}
            {...register('message')}
            rows={4}
          />
          {errors['message']?.message && (
            <p className="ml-1 mt-0.5 text-xs text-rose-500 drop-shadow-lg">
              {errors['message']?.message?.toString()}
            </p>
          )}
        </div>
      </div>

      <button
        className="trans-200 mt-21 flex h-10 min-w-[100px] items-center justify-center rounded-lg bg-sky-500 px-21 text-sm font-semibold text-primary shadow-md hover:bg-sky-400"
        onClick={handleSubmit(sendMessage)}
      >
        {loading ? (
          <LuLoaderCircle
            size={20}
            className="animate-spin"
          />
        ) : (
          t('Send Message')
        )}
      </button>
    </div>
  )
}

export default ContactForm
