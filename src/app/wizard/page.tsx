import { getMySettingsApi } from '@/requests'
import { getServerSession } from 'next-auth'
import Link from 'next/link'
import authOptions from '../api/auth/[...nextauth]/authOptions'
import SettingsBox from '@/components/SettingsBox'
import { redirect } from 'next/navigation'
import { ISettings } from '@/models/SettingsModel'

async function WizardPage() {
  const session = await getServerSession(authOptions)
  const user = session?.user
  let settings: ISettings | null = null

  if (!user) {
    redirect('/auth/login')
  }

  try {
    const { settings: s } = await getMySettingsApi(
      `?userId=${user._id}`,
      process.env.NEXT_PUBLIC_APP_URL
    )

    settings = s
  } catch (err: any) {
    console.log(err)
  }

  if (settings) {
    redirect('/')
  }

  return (
    <div className="flex h-screen w-screen items-center justify-center gap-4">
      <div className="flex max-w-2xl flex-col gap-4">
        <div>
          <h1 className="text-center text-3xl">
            Welcome, <span className="ml-2 font-bold">{user.firstName}! 👋</span>
          </h1>
          <h2 className="mt-4 text-center text-base text-muted-foreground">
            Let&apos;s get started by setting up your currency
          </h2>
          <h3 className="mt-2 text-center text-sm text-muted-foreground">
            You can change these setting at any time
          </h3>
        </div>

        <div className="h-px w-full border-t border-slate-200/30" />

        <SettingsBox />

        <div className="h-px w-full border-t border-slate-200/30" />

        <Link
          href="/"
          className="trans-200 border-light text-dark hover:text-light flex h-10 w-full items-center justify-center rounded-md border-2 text-center text-sm font-semibold"
        >
          I&apos;m done! Take me to the dashboard
        </Link>
      </div>
    </div>
  )
}

export default WizardPage
