'use client'

import Header from '@/components/Header'
import { useTheme } from 'next-themes'
import { ReactNode } from 'react'

function MoreLayout({
  children,
}: Readonly<{
  children: ReactNode
}>) {
  const { resolvedTheme } = useTheme()

  return (
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
  )
}

export default MoreLayout
