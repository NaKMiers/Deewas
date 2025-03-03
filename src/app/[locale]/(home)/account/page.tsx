'use client'

import Countdown from '@/components/Countdown'
import ConfirmDialog from '@/components/dialogs/ConfirmDialog'
import SettingsBox from '@/components/SettingsBox'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Link } from '@/i18n/navigation'
import { deleteAllDataApi } from '@/requests'
import {
  LucideBookCopy,
  LucideChevronRight,
  LucideInfo,
  LucideLoaderCircle,
  LucideShieldQuestion,
  Moon,
  Sun,
} from 'lucide-react'
import moment from 'moment-timezone'
import { signOut, useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { useTheme } from 'next-themes'
import Image from 'next/image'
import { useCallback, useState } from 'react'
import toast from 'react-hot-toast'

function AccountPage() {
  // hooks
  const { data: session } = useSession()
  const user: any = session?.user
  const t = useTranslations('accountPage')
  const { theme, resolvedTheme, setTheme } = useTheme()

  // states
  const [deleting, setDeleting] = useState<boolean>(false)

  // MARK: Delete Data
  const handleDeleteData = useCallback(async () => {
    // start loading
    setDeleting(true)
    toast.loading(t('Deleting all data') + '...', { id: 'delete-all-data' })

    try {
      const { message } = await deleteAllDataApi()
      toast.success(message, { id: 'delete-all-data' })
    } catch (err: any) {
      toast.error(err.message, { id: 'delete-all-data' })
      console.log(err)
    } finally {
      // stop loading
      setDeleting(false)
    }
  }, [t])

  return (
    <div className="container flex flex-col gap-21/2 p-21/2 pb-32 md:gap-21 md:p-21">
      {/* Account */}
      <div className="p2 overflow-auto rounded-md border p-2">
        <div className="flex w-full items-center gap-2 pb-2">
          <div className="aspect-square max-w-[40px] flex-shrink-0 overflow-hidden rounded-full shadow-sm">
            <Image
              className="h-full w-full object-cover"
              src={user?.avatar || process.env.NEXT_PUBLIC_DEFAULT_AVATAR}
              width={50}
              height={50}
              alt="avatar"
            />
          </div>
          <div className="">
            <h1 className="text-xl font-bold">{user?.name}</h1>
            <p
              className="flex items-center gap-2 text-sm text-muted-foreground"
              title={user?.email}
            >
              {user?.email}
              <Image
                src={`/icons/${user.authType}.png`}
                width={18}
                height={18}
                alt="google"
              />
            </p>
          </div>
        </div>
        <div className="border-t py-2 text-center font-semibold capitalize">{t('Free Account')}</div>
      </div>

      {/* Ads */}
      <div className="flex flex-col gap-2 rounded-md border p-2">
        <div className="flex justify-between gap-2">
          <span className="font-semibold">{t('Flash Sale')}</span>
          <Countdown
            timeType="once"
            start={moment().startOf('day').toISOString()}
            expire={moment().endOf('day').toISOString()}
          />
        </div>

        <div className="flex justify-center md:justify-start">
          <div className="flex max-w-[400px] overflow-hidden">
            <Image
              className="w-full object-contain"
              src="/images/flash-sale.png"
              width={400}
              height={150}
              alt="flash-sale"
            />
          </div>
        </div>
      </div>

      {/* Categories & Wallets */}
      <div className="flex flex-col rounded-md border px-21/2 py-2 md:px-21">
        <Link
          href="/categories"
          className="flex h-8 items-center gap-2 text-sm"
        >
          <LucideBookCopy
            size={18}
            className="cursor-pointer"
          />
          {t('Categories')}
          <div className="flex flex-1 items-center justify-end">
            <LucideChevronRight size={18} />
          </div>
        </Link>
      </div>

      {/* Theme */}
      <div className="flex items-center gap-2 rounded-md border px-21/2 py-2 md:px-21">
        <span className="font-semibold">{t('Theme')}</span>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="justify-normal rounded-md border p-21/2 text-sm font-semibold capitalize md:p-21"
            >
              {resolvedTheme === 'light' ? <Sun /> : <Moon />}
              {theme}
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="start">
            <DropdownMenuItem onClick={() => setTheme('light')}>{t('Light')}</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme('dark')}>{t('Dark')}</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme('system')}>{t('System')}</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Settings */}
      <SettingsBox isRequireInit />

      {/* More */}
      <div className="flex flex-col rounded-lg border px-21/2 py-2 md:px-21">
        <Link
          href="/"
          className="flex h-8 items-center gap-2 text-sm"
        >
          <LucideInfo size={18} />
          {t('About')}
        </Link>
        <Link
          href="/"
          className="flex h-8 items-center gap-2 text-sm"
        >
          <LucideShieldQuestion size={18} />
          {t('Help & Support')}
        </Link>
      </div>

      {/* Danger */}
      <ConfirmDialog
        label={t('Delete All Data')}
        desc={t('Are you sure you want to delete all your data? This action is irreversible.')}
        confirmLabel={t('Delete')}
        cancelLabel={t('Cancel')}
        onConfirm={handleDeleteData}
        trigger={
          !deleting ? (
            <Button
              variant="outline"
              className="mt-8 w-full border-rose-500 text-sm font-semibold capitalize text-rose-500"
            >
              {t('Delete All Data')}
            </Button>
          ) : (
            <Button
              disabled
              variant="outline"
              className="mt-8 w-full border-rose-500 text-sm font-semibold capitalize text-rose-500"
            >
              <LucideLoaderCircle className="animate-spin" />
            </Button>
          )
        }
      />

      <ConfirmDialog
        label={t('Log Out')}
        desc={t('Are you sure you want to log out?')}
        confirmLabel={t('Log Out')}
        cancelLabel="Cancel"
        onConfirm={signOut}
        trigger={
          <Button
            variant="outline"
            className="mt-8 w-full border-rose-500 text-sm font-semibold capitalize text-rose-500"
          >
            {t('Log Out')}
          </Button>
        }
      />
    </div>
  )
}

export default AccountPage
