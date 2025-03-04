'use client'

import SettingsBox from '@/components/SettingsBox'
import { Button } from '@/components/ui/button'
import { redirect } from '@/i18n/navigation'
import { shortName } from '@/lib/string'
import { updateUserApi } from '@/requests'
import { useSession } from 'next-auth/react'
import { useLocale, useTranslations } from 'next-intl'
import { useCallback } from 'react'

function WizardPage() {
  // hooks
  const { data: session, update } = useSession()
  const user: any = session?.user
  const t = useTranslations('wizardPage')
  const locale = useLocale()

  if (user?.initiated) {
    redirect({ href: '/', locale })
  }

  // update user initiated
  const handleUpdateInitiated = useCallback(async () => {
    try {
      await updateUserApi({ initiated: true })
      await update()
    } catch (err: any) {
      console.log(err)
    }
  }, [update])

  return (
    <div className="md:px-21 container flex h-screen w-screen items-center justify-center gap-4 px-21/2">
      <div className="flex max-w-2xl flex-col gap-4">
        <div>
          <h1 className="text-center text-3xl">
            {t('Welcome')}, <span className="ml-2 font-bold">{user && shortName(user)}! 👋</span>
          </h1>
          <h2 className="mt-4 text-center text-base text-muted-foreground">
            {t("Let's start with some simple settings")}
          </h2>
          <h3 className="mt-2 text-center text-sm text-muted-foreground">
            {t('You can change these setting at any time')}
          </h3>
        </div>

        <div className="h-px w-full border-t border-slate-200/30" />

        <SettingsBox />

        <div className="h-px w-full border-t border-slate-200/30" />

        <Button
          variant="outline"
          className="flex h-10 w-full items-center justify-center rounded-md text-center text-sm font-semibold"
          onClick={handleUpdateInitiated}
        >
          {t("I'm done! Take me to the dashboard")}
        </Button>
      </div>
    </div>
  )
}

export default WizardPage
