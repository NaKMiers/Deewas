import authOptions from '@/app/api/auth/[...nextauth]/authOptions'
import StoreProvider from '@/components/providers/StoreProvider'
import { routing } from '@/i18n/routing'
import { getServerSession } from 'next-auth'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages, getTranslations } from 'next-intl/server'
import { notFound } from 'next/navigation'
import NextTopLoader from 'nextjs-toploader'
import { ReactNode } from 'react'
import { Toaster } from 'react-hot-toast'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'metaData' })
  return {
    title: t('title'),
    description: t('description'),
    locale,

    icons: {
      icon: ['/favicon.ico?v=4'],
      apple: ['/apple-touch-icon.png?v=4'],
      shortcut: ['/apple-touch-icon.png'],
    },
    manifest: '/site.webmanifest',
  }
}

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: ReactNode
  params: Promise<{ locale: string }>
}>) {
  // Ensure that the incoming `locale` is valid
  const { locale } = await params
  if (!routing.locales.includes(locale as any)) {
    notFound()
  }

  const session = await getServerSession(authOptions)
  const messages = await getMessages()

  return (
    <html lang={locale}>
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no"
        />
      </head>
      <body>
        <NextIntlClientProvider messages={messages}>
          <StoreProvider session={session}>
            {/* Toast */}
            <Toaster
              position="bottom-center"
              containerClassName="mb-[68px]"
            />

            {/* Top Loader */}
            <NextTopLoader
              color="#F7E360"
              initialPosition={0.08}
              crawlSpeed={200}
              height={3}
              crawl={true}
              showSpinner={false}
              easing="ease"
              speed={200}
              shadow="0 0 10px #F7E360,0 0 5px #F7E360"
              zIndex={1600}
              showAtBottom={false}
            />
            {children}
          </StoreProvider>{' '}
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
