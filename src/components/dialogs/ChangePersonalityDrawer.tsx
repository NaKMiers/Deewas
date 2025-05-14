'use client'

import { personalities } from '@/constants'
import { useAppDispatch, useAppSelector } from '@/hooks/reduxHook'
import { setClearChat } from '@/lib/reducers/screenReducer'
import { setSettings } from '@/lib/reducers/settingsReducer'
import { cn } from '@/lib/utils'
import { updateMySettingsApi } from '@/requests'
import { LucideCheckCircle, LucideLoaderCircle } from 'lucide-react'
import { useTranslations } from 'next-intl'
import Image from 'next/image'
import { ReactNode, useCallback, useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { Button } from '../ui/button'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '../ui/drawer'

interface ChangePersonalityDrawerProps {
  trigger: ReactNode
  className?: string
}

function ChangePersonalityDrawer({ trigger, className }: ChangePersonalityDrawerProps) {
  // hooks
  const t = useTranslations('changePersonalityDrawer')
  const tSuccess = useTranslations('success')
  const tError = useTranslations('error')
  const dispatch = useAppDispatch()

  const { settings } = useAppSelector(state => state.settings)

  // states
  const [open, setOpen] = useState<boolean>(false)
  const [saving, setSaving] = useState<boolean>(false)
  const [selected, setSelected] = useState<any>(null)

  // initially set selected personality
  useEffect(() => {
    if ((settings?.personalities?.[0] ?? -1) >= 0) {
      const selected = personalities.find(p => p.id === settings?.personalities[0])
      setSelected(selected)
    }
  }, [settings])

  // validate
  const validate = useCallback(() => {
    let isValid = true

    if (!settings) return false
    if (!selected) {
      toast.error(tError('Please select a personality'))
      return false
    }
    if (settings?.personalities[0] === selected.id) {
      setOpen(false)
      return false
    }

    return isValid
  }, [tError, selected, settings])

  // change personalities
  const handleChangePersonalities = useCallback(async () => {
    // validate
    if (!validate()) return
    // check if at least one personality is selected
    if (!selected) {
      return toast.error(tError('Please select a personality'))
    }

    // start loading
    setSaving(true)

    try {
      // update settings in API
      const { settings } = await updateMySettingsApi({
        personalities: [selected.id],
      })

      toast.success(tSuccess('Personality changed'), { id: 'change-personality' })

      // update settings in store
      dispatch(setSettings(settings))
      dispatch(setClearChat(true))
      setOpen(false)
    } catch (err: any) {
      toast.error(tError('Failed to change personalities'), { id: 'change-personality' })
      console.log(err)
    } finally {
      // stop loading
      setSaving(false)
    }
  }, [dispatch, validate, tError, tSuccess, selected])

  return (
    <Drawer
      open={open}
      onOpenChange={setOpen}
    >
      <DrawerTrigger asChild>{trigger}</DrawerTrigger>

      <DrawerContent className={cn(className)}>
        <div className="mx-auto w-full max-w-sm px-21/2">
          {/* MARK: Header */}
          <DrawerHeader>
            <DrawerTitle className="text-center">
              {t('Pick a personality for Deewas assistant?')}
            </DrawerTitle>
          </DrawerHeader>

          {/* MARK: Total */}
          <div className="grid grid-cols-2 gap-21/2">
            {personalities.map((item, index) => (
              <button
                className={cn(
                  'relative flex w-full flex-col items-center rounded-lg border-2 border-transparent bg-secondary p-2',
                  selected?.id === item.id && 'border-primary'
                )}
                onClick={() => setSelected(selected?.id !== item.id ? item : selected)}
                key={index}
              >
                {selected?.id === item.id && (
                  <LucideCheckCircle
                    className="absolute right-21/2 top-21/2"
                    size={20}
                    color="#22c55e"
                  />
                )}

                <div className="h-[70px] w-[70px]">
                  <Image
                    src={item.image}
                    width={80}
                    height={80}
                    alt={item.title}
                    className="h-full w-full object-cover"
                  />
                </div>

                <p className="text-center text-sm font-semibold">{t(item.title)}</p>
              </button>
            ))}
          </div>

          {/* MARK: Drawer Footer */}
          <DrawerFooter className="mb-21 px-0">
            <div className="mt-3 flex items-center justify-end gap-21/2">
              <DrawerClose>
                <Button
                  variant="secondary"
                  className="h-10 rounded-md px-21/2 text-[13px] font-semibold"
                  onClick={() => setOpen(false)}
                >
                  {t('Cancel')}
                </Button>
              </DrawerClose>
              <Button
                disabled={saving}
                variant="default"
                className="h-10 min-w-[60px] rounded-md px-21/2 text-[13px] font-semibold"
                onClick={handleChangePersonalities}
              >
                {saving ? (
                  <LucideLoaderCircle
                    size={20}
                    className="animate-spin text-muted-foreground"
                  />
                ) : (
                  t('Save')
                )}
              </Button>
            </div>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  )
}

export default ChangePersonalityDrawer
