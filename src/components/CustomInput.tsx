import { cn } from '@/lib/utils'
import React, { memo, useCallback, useState } from 'react'
import { FieldErrors, FieldValues, UseFormRegister } from 'react-hook-form'
import { FaEye } from 'react-icons/fa'
import { Input } from './ui/input'

interface InputProps {
  label: string
  icon?: React.ElementType
  className?: string

  id: string
  type?: string
  disabled?: boolean
  required?: boolean
  onChange?: any
  register: UseFormRegister<FieldValues>
  errors: FieldErrors
  options?: any[]
  rows?: number
  labelBg?: string
  onClick?: (e?: any) => void
  onFocus?: (e?: any) => void

  // rest
  [key: string]: any
}

function CustomInput({
  id,
  type = 'text',
  disabled,
  required,
  register,
  errors,
  label,
  onChange,
  icon: Icon,
  options,
  onClick,
  onFocus,
  className = '',
  ...rest
}: InputProps) {
  // states
  const [isShowPassword, setIsShowPassword] = useState<boolean>(false)

  // show password
  const showPassword = useCallback(() => {
    setIsShowPassword(prev => !prev)
  }, [])

  return (
    <div
      className={cn(className)}
      onClick={onClick}
      onFocus={onFocus}
    >
      <label
        htmlFor={id}
        className={cn('ml-1 text-xs font-semibold', errors[id] ? 'text-rose-400' : '')}
      >
        {label}
      </label>

      <div
        className={cn(
          'relative mt-0.5 flex h-10 rounded-lg',
          errors[id] ? 'border-rose-500' : 'border-dark'
        )}
      >
        <Input
          id={id}
          className="number-input peer block h-full w-full rounded-lg px-2.5 text-sm focus:outline-none focus:ring-0"
          disabled={disabled}
          type={type === 'password' ? (isShowPassword ? 'text' : 'password') : type}
          {...register(id, { required })}
          onWheel={e => e.currentTarget.blur()}
          placeholder=""
          onChange={onChange}
          {...rest}
        />

        {type === 'password' &&
          (isShowPassword ? (
            <FaEye
              className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
              size={19}
              onClick={showPassword}
            />
          ) : (
            <FaEye
              className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
              size={19}
              onClick={showPassword}
            />
          ))}
      </div>

      {/* MARK: Error */}
      {!errors[id]?.message && (
        <p className="ml-1 mt-0.5 text-xs text-rose-400 drop-shadow-lg">
          {errors[id]?.message?.toString()}
        </p>
      )}
    </div>
  )
}

export default memo(CustomInput)
