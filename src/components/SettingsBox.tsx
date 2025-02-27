'use client'

import { currencies, languages } from '@/constants/settings'
import { useAppDispatch } from '@/hooks/reduxHook'
import { setSettings } from '@/lib/reducers/settingsReducer'
import { cn } from '@/lib/utils'
import { updateMySettingsApi } from '@/requests'
import { useSession } from 'next-auth/react'
import { useTheme } from 'next-themes'
import { useCallback, useState } from 'react'
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
}

function SettingsBox({ className = '' }: SettingsBoxProps) {
  return (
    <div className={cn('grid grid-cols-1 gap-21/2 md:grid-cols-2 md:gap-21', className)}>
      <Box
        type="currency"
        desc="Set your default currency for transactions"
        list={currencies}
      />
      <Box
        type="language"
        desc="Set your default language for the app."
        list={languages}
      />
    </div>
  )
}

interface BoxProps {
  type: string
  desc: string
  list: any[]
  className?: string
}

function Box({ type, desc, list, className = '' }: BoxProps) {
  // hooks
  const dispatch = useAppDispatch()
  const { setTheme, resolvedTheme } = useTheme()
  const { data: session } = useSession()
  const user: any = session?.user

  // states
  const [open, setOpen] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(false)
  const [selected, setSelected] = useState<any>(null)

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

        console.log('settings', settings)

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

  return (
    <div className={cn('relative w-full items-center justify-center rounded-lg border p-21', className)}>
      <p
        className="font-bold capitalize"
        onClick={() => setTheme(resolvedTheme === 'light' ? 'dark' : 'light')}
      >
        {type}
      </p>
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
            <p className="capitalize">{selected ? selected.label : `Select ${type}`}</p>

            <LuChevronsUpDown size={18} />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0 shadow-md">
          {/* Search Bar */}
          <Command className="rounded-lg border shadow-md md:min-w-[450px]">
            <CommandInput placeholder={`Find a ${type}...`} />
            <CommandList>
              <CommandEmpty>No results found.</CommandEmpty>
              <CommandSeparator />
              {list.map((item, index) => (
                <CommandItem
                  onSelect={() => {
                    handleUpdateSettings(item.value)
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

export default SettingsBox
