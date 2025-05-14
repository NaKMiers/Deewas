'use client'

import ConfirmDialog from '@/components/dialogs/ConfirmDialog'
import SettingsBox from '@/components/SettingsBox'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { useAppDispatch } from '@/hooks/reduxHook'
import { refresh, setRefreshing } from '@/lib/reducers/loadReducer'
import { shortName } from '@/lib/string'
import { checkPremium, cn } from '@/lib/utils'
import { deleteAllDataApi, updateUserApi } from '@/requests'
import {
  BookCopy,
  ChevronRight,
  Info,
  Moon,
  Pencil,
  Save,
  ShieldQuestion,
  Sun,
  WalletCards,
  X,
} from 'lucide-react'
import { signOut, useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { useTheme } from 'next-themes'
import Image from 'next/image'
import Link from 'next/link'
import { useCallback, useState } from 'react'
import toast from 'react-hot-toast'

function AccountPage() {
  // Hooks
  const { data: session, update } = useSession()
  const user: any = session?.user
  const isPremium = checkPremium(user)
  const t = useTranslations('accountPage')
  const tError = useTranslations('error')
  const { theme, resolvedTheme, setTheme } = useTheme()
  const dispatch = useAppDispatch()

  // States
  const [deleting, setDeleting] = useState<boolean>(false)
  const [editMode, setEditMode] = useState<boolean>(false)
  const [usnValue, setUsnValue] = useState<string>(shortName(user, ''))
  const [updating, setUpdating] = useState<boolean>(false)
  const [error, setError] = useState<string>('')

  // MARK: Delete Data
  const handleDeleteData = useCallback(async () => {
    setDeleting(true)
    try {
      const { message } = await deleteAllDataApi()
      toast.success(message)
      dispatch(refresh())
    } catch (err: any) {
      toast.error(err.message)
      console.log(err)
    } finally {
      setDeleting(false)
      dispatch(setRefreshing(false))
    }
  }, [dispatch])

  // Handle update settings
  const handleChangeUsername = useCallback(async () => {
    if (!user) return
    if (!usnValue.trim()) return
    if (usnValue.trim().length < 5) return setError('Username must be at least 5 characters')

    setUpdating(true)
    try {
      const data: any = {}
      if (user.authType === 'local') data.username = usnValue.trim()
      else data.name = usnValue.trim()
      await updateUserApi(data)
      setEditMode(false)
      await update()
    } catch (err: any) {
      err.errorCode === 'USERNAME_EXISTS' ? setError(err.message) : setError('Failed to change username')
    } finally {
      setUpdating(false)
    }
  }, [update, user, usnValue])

  // Redirect if not authenticated
  if (!user) {
    return <Link href="/auth/sign-in" />
  }

  const authImage =
    user.authType !== 'google'
      ? `/icons/${user.authType}-${resolvedTheme === 'dark' ? 'light' : 'dark'}.png`
      : '/icons/google.png'

  return (
    <div className="container flex min-h-[calc(100vh-50px)] flex-col gap-21/2 p-21/2 md:gap-21 md:p-21">
      {/* MARK: Account */}
      <div className="rounded-xl border border-primary/10 bg-secondary/50 p-21 shadow-md">
        <div className="flex items-center gap-21/2 pb-2">
          {user.authType === 'google' && (
            <div className="relative aspect-square max-w-[40px] rounded-full shadow-sm">
              <Image
                src={user.avatar || '/default-avatar.png'}
                alt="avatar"
                width={50}
                height={50}
                className="h-full w-full rounded-full object-cover"
              />
              {isPremium && (
                <Image
                  src="/icons/crown.png"
                  alt="crown"
                  width={28}
                  height={28}
                  className="absolute right-[-5px] top-[-16px] rotate-[24deg] transform"
                />
              )}
            </div>
          )}
          <div className="flex-1">
            <div className="flex items-center gap-2">
              {!editMode ? (
                <>
                  <p className="text-xl font-bold">{shortName(user)}</p>
                  <div className="h-5 w-5">
                    <Image
                      src={authImage}
                      alt="auth icon"
                      width={20}
                      height={20}
                      className="h-full w-full"
                    />
                  </div>
                </>
              ) : (
                <div>
                  {error && (
                    <p className="mb-0.5 text-sm text-rose-500 drop-shadow-lg">{tError(error)}</p>
                  )}
                  <Input
                    className={cn(
                      'mb-1 w-[200px] rounded-lg bg-primary/20 px-3 py-2 font-medium tracking-wider text-primary !ring-0',
                      user.authType === 'local' && 'lowercase'
                    )}
                    placeholder={`${t('Username')}...`}
                    value={usnValue}
                    onChange={e => setUsnValue(e.target.value)}
                    onFocus={() => setError('')}
                  />
                </div>
              )}
            </div>
            <p className="flex items-center gap-2 text-muted-foreground">{user.email}</p>
          </div>

          <div className="flex items-start gap-1">
            {!updating && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setEditMode(!editMode)
                  setError('')
                }}
              >
                {editMode ? <X size={18} /> : <Pencil size={16} />}
              </Button>
            )}

            {usnValue.trim() && usnValue.trim() !== shortName(user) && !updating && editMode && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleChangeUsername}
              >
                <Save
                  size={18}
                  color="#4ade80"
                />
              </Button>
            )}

            {updating && (
              <div className="py-2.5">
                <div className="h-5 w-5 animate-spin rounded-full border-b-2 border-t-2 border-primary" />
              </div>
            )}
          </div>
        </div>
        <div className="mt-2 border-t border-primary py-2">
          <p className="text-center font-semibold capitalize">
            {isPremium ? t('Premium Account') : t('Free Account')}
          </p>
        </div>
      </div>

      {/* MARK: Categories & Wallets */}
      <div className="rounded-xl border border-primary/10 bg-secondary/50 p-21/2 shadow-md md:p-21">
        <Link
          href="/wallets"
          className="flex h-10 items-center gap-2"
        >
          <WalletCards size={18} />
          <p className="font-semibold">{t('Wallets')}</p>
          <div className="flex flex-1 items-center justify-end">
            <ChevronRight size={18} />
          </div>
        </Link>
        <Link
          href="/categories"
          className="flex h-10 items-center gap-2"
        >
          <BookCopy size={18} />
          <p className="font-semibold">{t('Categories')}</p>
          <div className="flex flex-1 items-center justify-end">
            <ChevronRight size={18} />
          </div>
        </Link>
      </div>

      {/* MARK: Theme */}
      <div className="flex items-center gap-2 rounded-xl border border-primary/10 bg-secondary/50 p-21/2 shadow-md md:p-21">
        <p className="font-semibold">{t('Theme')}</p>

        <div>
          <Select onValueChange={value => setTheme(value)}>
            <SelectTrigger className="flex border border-primary/10 bg-secondary !ring-0">
              {theme === 'light' ? <Sun size={18} /> : <Moon size={18} />}
              <span className="ml-1 capitalize">{t(theme)}</span>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="system">{t('System')}</SelectItem>
              <SelectItem value="light">{t('Light')}</SelectItem>
              <SelectItem value="dark">{t('Dark')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* MARK: Settings & Exporter */}
      <SettingsBox isRequireInit />
      {/* <FileExporter className="rounded-xl border border-primary/10 p-6" /> */}

      {/* MARK: More */}
      <div className="rounded-xl border border-primary/10 bg-secondary/50 p-21/2 shadow-md md:p-21">
        <Link
          href="/about"
          className="flex h-11 items-center gap-2"
        >
          <Info size={18} />
          <p className="font-semibold">{t('About')}</p>
        </Link>
        <Link
          href="/support"
          className="flex h-11 items-center gap-2"
        >
          <ShieldQuestion size={18} />
          <p className="font-semibold">{t('Help & Support')}</p>
        </Link>
      </div>

      <p className="text-center font-medium text-muted-foreground">
        {t('Version')}: {process.env.NEXT_PUBLIC_APP_VERSION || 'Website'}
      </p>

      {/* MARK: Danger */}
      <ConfirmDialog
        label={t('Delete All Data')}
        desc={t('Are you sure you want to delete all your data? This action is irreversible')}
        confirmLabel={t('Delete')}
        cancelLabel={t('Cancel')}
        onConfirm={handleDeleteData}
        trigger={
          !deleting ? (
            <Button
              variant="outline"
              className={cn('mt-8 w-full border-rose-500 bg-rose-500/10 hover:bg-rose-500/20')}
            >
              <span className="font-semibold capitalize text-rose-500">{t('Delete All Data')}</span>
            </Button>
          ) : (
            <div className="h-5 w-5 animate-spin rounded-full border-b-2 border-t-2 border-primary" />
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
            className={cn('mt-8 w-full border-rose-500 bg-rose-500/10 hover:bg-rose-500/20')}
          >
            <span className="font-semibold capitalize text-rose-500">{t('Log Out')}</span>
          </Button>
        }
      />

      <Separator className="my-16 h-0" />
    </div>
  )
}

export default AccountPage
