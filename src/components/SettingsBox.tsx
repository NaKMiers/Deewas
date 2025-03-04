'use client'

import { currencies, languages } from '@/constants/settings'
import { useAppDispatch, useAppSelector } from '@/hooks/reduxHook'
import { usePathname, useRouter } from '@/i18n/navigation'
import { setSettings } from '@/lib/reducers/settingsReducer'
import { cn } from '@/lib/utils'
import { updateMySettingsApi } from '@/requests'
import { useLocale, useTranslations } from 'next-intl'
import { memo, useCallback, useState } from 'react'
import toast from 'react-hot-toast'
import { LuChevronsUpDown } from 'react-icons/lu'
import { Button } from './ui/button'
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from './ui/command'
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover'

interface SettingsBoxProps {
  className?: string
  isRequireInit?: boolean
}

function SettingsBox({ isRequireInit, className = '' }: SettingsBoxProps) {
  // hooks
  const locale = useLocale()
  const t = useTranslations('settingsBox')

  // store
  const { settings } = useAppSelector(state => state.settings)
  const currency = settings?.currency
  console.log('currency:', currency)

  return (
    <div className={cn('grid grid-cols-1 gap-21/2 md:grid-cols-2 md:gap-21', className)}>
      {isRequireInit ? (
        currency ? (
          <Box
            type="currency"
            desc={t('Set your default currency')}
            list={currencies}
            init={currencies.find(c => c.value === currency)}
          />
        ) : null
      ) : (
        <Box
          type="currency"
          desc={t('Set your default currency')}
          list={currencies}
          init={currencies.find(c => c.value === 'USD')}
        />
      )}
      <Box
        type="language"
        desc={t('Set your default language')}
        list={languages}
        init={languages.find(l => l.value === locale)}
      />
    </div>
  )
}

export default memo(SettingsBox)

interface BoxProps {
  type: string
  desc: string
  list: any[]
  init?: any
  className?: string
}

function Box({ type, desc, list, init, className = '' }: BoxProps) {
  // hooks
  const dispatch = useAppDispatch()
  const pathname = usePathname()
  const router = useRouter()
  const t = useTranslations('settingsBox')

  // states
  const [open, setOpen] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(false)
  const [selected, setSelected] = useState<any>(init)

  // handle update settings
  const handleUpdateSettings = useCallback(
    async (value: any) => {
      if (!value) return

      // start loading
      setLoading(true)
      toast.loading(`Setting ${type}...`, { id: `update-${type}` })

      try {
        const { settings } = await updateMySettingsApi({
          [type]: value,
        })

        toast.success(`Setting ${type} successfully`, { id: `update-${type}` })

        dispatch(setSettings(settings))
      } catch (err: any) {
        toast.error(err.message, { id: `update-${type}` })
        console.log(err)
      } finally {
        // stop loading
        setLoading(false)
      }
    },
    [dispatch, type]
  )

  // handle change language
  const handleChangeLanguage = useCallback(
    (nextLocale: string) => {
      router.push(pathname, { locale: nextLocale })
    },
    [router, pathname]
  )

  return (
    <div className={cn('relative w-full items-center justify-center rounded-lg border p-21', className)}>
      <p className="font-bold capitalize">{t(type)}</p>
      <p className="mb-3 text-sm text-muted-foreground">{desc}</p>

      <Popover
        open={open}
        onOpenChange={setOpen}
      >
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-between"
          >
            <p>{selected ? selected.label : `${t('Select')} ${t(type)}`}</p>

            <LuChevronsUpDown size={18} />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0 shadow-md">
          {/* Search Bar */}
          <Command className="rounded-lg border shadow-md md:min-w-[450px]">
            <CommandInput
              className="text-base md:text-sm"
              placeholder={`${t('Find a')} ${t(type)}...`}
            />
            <CommandList>
              <CommandEmpty>{t('No results found')}.</CommandEmpty>
              <CommandSeparator />
              {list.map((item, index) => (
                <CommandItem
                  onSelect={() => {
                    if (type === 'language') {
                      handleChangeLanguage(item.value)
                    } else {
                      handleUpdateSettings(item.value)
                    }
                    setSelected(item)
                    setOpen(false)
                  }}
                  className="cursor-pointer font-semibold"
                  key={index}
                >
                  {item.label}
                </CommandItem>
              ))}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  )
}
