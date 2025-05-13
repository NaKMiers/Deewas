'use client'

import PageLoading from '@/components/PageLoading'
import { useTheme } from 'next-themes'
import { ReactNode } from 'react'

function AuthLayout({
  children,
}: Readonly<{
  children: ReactNode
}>) {
  const { resolvedTheme } = useTheme()

  return (
    <>
      {/* Loading */}
      <PageLoading />

      {/* Main */}
      <main
        className=""
        style={{
          backgroundImage:
            resolvedTheme === 'light' ? 'url(/images/block-1.png)' : 'url(/images/block-2.png)',
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
        }}
      >
        {children}
      </main>
    </>
  )
}

export default AuthLayout
