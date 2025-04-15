import PageLoading from '@/components/PageLoading'
import { ReactNode } from 'react'

export default async function RootLayout({
  children,
}: Readonly<{
  children: ReactNode
}>) {
  return (
    <>
      {/* Loading */}
      <PageLoading />

      {/* Main */}
      <main className="">{children}</main>
    </>
  )
}
