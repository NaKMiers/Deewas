import StoreProvider from '@/components/providers/StoreProvider'
import type { Metadata } from 'next'
import { getServerSession } from 'next-auth'
import NextTopLoader from 'nextjs-toploader'
import { ReactNode } from 'react'
import { Toaster } from 'react-hot-toast'
import authOptions from './api/auth/[...nextauth]/authOptions'
import './globals.scss'

export const metadata: Metadata = {
  title: 'Deewas',
  description: 'Personal Expenses Manager With Powerful AI Features And Simple User Interface',
  icons: {
    icon: ['/favicon.ico?v=4'],
    apple: ['/apple-touch-icon.png?v=4'],
    shortcut: ['/apple-touch-icon.png'],
  },
  manifest: '/site.webmanifest',
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: ReactNode
}>) {
  const session = await getServerSession(authOptions)

  return (
    <html lang="en">
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no"
        />
      </head>
      <body>
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
        </StoreProvider>
      </body>
    </html>
  )
}
