import Header from '@/components/Header'
import Navbar from '@/components/Navbar'
import PageLoading from '@/components/PageLoading'
import UseSettings from '@/components/UseSettings'
import UseWallets from '@/components/UseWallets'
import { ReactNode } from 'react'
import { AI } from './actions'

export default async function AILayout({
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
      <main className="flex h-[calc(100vh-70px)] flex-col justify-between">
        <Header className="flex-shrink-0" />

        <AI>{children}</AI>
      </main>

      <Navbar />
    </>
  )
}
