import Header from '@/components/Header'
import Navbar from '@/components/Navbar'
import PageLoading from '@/components/PageLoading'
import UseSettings from '@/components/UseSettings'
import UseWallets from '@/components/UseWallets'
import { ReactNode } from 'react'

export default async function RootLayout({
  children,
}: Readonly<{
  children: ReactNode
}>) {
  return (
    <>
      <PageLoading />

      <UseWallets />
      <UseSettings />

      {/* Main */}
      <main className="h-[calc(100vh-60px)] overflow-y-auto">
        <Header />

        {children}
      </main>

      <Navbar />
    </>
  )
}
