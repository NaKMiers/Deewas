import { currencies } from '@/constants/settings'
import { useAppSelector } from '@/hooks/reduxHook'
import { adjustCurrency } from '@/lib/string'
import { cn } from '@/lib/utils'
import { memo, ReactNode, useCallback, useState } from 'react'
import { Controller, FieldErrors, FieldValues, UseFormRegister } from 'react-hook-form'
import { FaEye } from 'react-icons/fa'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'

interface InputProps {
  label: string
  icon?: ReactNode
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
  control,
  onFocus,
  className = '',
  ...rest
}: InputProps) {
  // store
  const currency = useAppSelector(state => state.settings.settings?.currency)
  const locale = currencies.find(c => c.value === currency)?.locale || 'en-US'

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
        className={cn('ml-1 text-xs font-semibold', errors[id] ? 'text-rose-500' : '')}
      >
        {label}
      </label>

      <div
        className={cn(
          'relative mt-0.5 flex h-9 rounded-lg',
          errors[id] ? 'border-rose-500' : 'border-dark'
        )}
      >
        {Icon && (
          <Button
            variant="outline"
            className="mr-1 w-9"
          >
            {Icon}
          </Button>
        )}

        {type === 'select' && control ? (
          <Controller
            name={id}
            control={control}
            rules={{ required }}
            render={({ field }) => (
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <SelectTrigger
                  className={cn('border', errors[id]?.message ? 'border-rose-500' : 'border-dark')}
                >
                  <SelectValue placeholder={label} />
                </SelectTrigger>
                <SelectContent>
                  {options?.map(option => (
                    <SelectItem
                      key={option.value}
                      value={option.value}
                    >
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        ) : type === 'currency' ? (
          <Controller
            name={id}
            control={control}
            rules={{ required }}
            render={({ field: { onChange, value } }) => (
              <Input
                id={id}
                className={cn(
                  'number-input peer block h-full w-full touch-manipulation appearance-none rounded-lg px-2.5 focus:outline-none focus:ring-0',
                  errors[id]?.message ? 'border-rose-500' : 'border-dark'
                )}
                disabled={disabled}
                type="text"
                value={adjustCurrency(value || '', locale)}
                onChange={onChange}
                {...rest}
              />
            )}
          />
        ) : (
          <Input
            id={id}
            className={cn(
              'number-input peer block h-full w-full touch-manipulation appearance-none rounded-lg px-2.5 focus:outline-none focus:ring-0',
              errors[id]?.message ? 'border-rose-500' : 'border-dark'
            )}
            disabled={disabled}
            type={type === 'password' ? (isShowPassword ? 'text' : 'password') : type}
            {...register(id, { required })}
            onWheel={e => e.currentTarget.blur()}
            placeholder=""
            onChange={onChange}
            {...rest}
          />
        )}

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
      {errors[id]?.message && (
        <p className="ml-1 mt-0.5 text-xs text-rose-500 drop-shadow-lg">
          {errors[id]?.message?.toString()}
        </p>
      )}
    </div>
  )
}

export default memo(CustomInput)
