'use client'

import Header from '@/components/Header'
import Navbar from '@/components/Navbar'
import PageLoading from '@/components/PageLoading'
import useInit from '@/hooks/useInit'
import useSettings from '@/hooks/useSettings'
import { useTheme } from 'next-themes'
import { ReactNode } from 'react'

function HomeLayout({
  children,
}: Readonly<{
  children: ReactNode
}>) {
  const { resolvedTheme } = useTheme()
  useSettings()
  useInit()

  return (
    <>
      <PageLoading />

      {/* Main */}
      <main
        className="bg-[url(/images/pre-bg-v-flip.png)] bg-cover bg-fixed bg-center bg-no-repeat"
        style={{
          backgroundImage:
            resolvedTheme === 'light' ? 'url(/images/light-bg.png)' : 'url(/images/dark-bg.png)',
        }}
      >
        <Header />

        {children}
      </main>

      <Navbar />
    </>
  )
}

export default HomeLayout
