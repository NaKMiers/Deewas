'use client'

import SettingsBox from '@/components/SettingsBox'
import { Link } from '@/i18n/navigation'
import { shortName } from '@/lib/string'
import { useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'

function WizardPage() {
  // hooks
  const { data: session } = useSession()
  const user: any = session?.user
  const t = useTranslations('wizardPage')

  return (
    <div className="flex h-screen w-screen items-center justify-center gap-4">
      <div className="flex max-w-2xl flex-col gap-4">
        <div>
          <h1 className="text-center text-3xl">
            {t('Welcome')}, <span className="ml-2 font-bold">{user && shortName(user)}! 👋</span>
          </h1>
          <h2 className="mt-4 text-center text-base text-muted-foreground">
            {t("Let's get started by setting up your currency")}
          </h2>
          <h3 className="mt-2 text-center text-sm text-muted-foreground">
            {t('You can change these setting at any time')}
          </h3>
        </div>

        <div className="h-px w-full border-t border-slate-200/30" />

        <SettingsBox />

        <div className="h-px w-full border-t border-slate-200/30" />

        <Link
          href="/"
          className="trans-200 border-light text-dark hover:text-light flex h-10 w-full items-center justify-center rounded-md border-2 text-center text-sm font-semibold"
        >
          {"I'm done! Take me to the dashboard"}
        </Link>
      </div>
    </div>
  )
}

export default WizardPage
