'use client'

import { languages } from '@/constants/settings'
import { usePathname, useRouter } from '@/i18n/navigation'
import { useLocale, useTranslations } from 'next-intl'
import { memo, useCallback, useState } from 'react'
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

function LanguageSelector({ className }: { className?: string }) {
  // hooks
  const pathname = usePathname()
  const router = useRouter()
  const t = useTranslations('settingsBox')
  const locale = useLocale()

  // states
  const [open, setOpen] = useState<boolean>(false)
  const [selected, setSelected] = useState<any>(languages.find(lang => lang.value === locale) || null)

  // handle change language
  const handleChangeLanguage = useCallback(
    (nextLocale: string) => {
      router.push(pathname, { locale: nextLocale })
    },
    [router, pathname]
  )

  return (
    <Popover
      open={open}
      onOpenChange={setOpen}
    >
      <PopoverTrigger
        asChild
        className={className}
      >
        <Button
          variant="outline"
          className="justify-between border border-primary/10 bg-primary-foreground"
        >
          <p>{selected ? selected.label : `${t('Select')} ${t('language')}`}</p>
          <LuChevronsUpDown size={18} />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0 shadow-md">
        {/* Search Bar */}
        <Command className="rounded-lg border shadow-md md:min-w-[450px]">
          <CommandInput
            autoFocus={false}
            className="text-base md:text-sm"
            placeholder={`${t('Find a')} ${t('language')}...`}
          />
          <CommandList>
            <CommandEmpty>{t('No results found')}.</CommandEmpty>
            <CommandSeparator />
            {languages.map((item, index) => (
              <CommandItem
                onSelect={() => {
                  handleChangeLanguage(item.value)
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
  )
}

export default memo(LanguageSelector)
