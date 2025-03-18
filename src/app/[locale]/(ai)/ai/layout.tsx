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
      <main className="flex h-[calc(100vh-64px-21px/2)] flex-col justify-between">
        <Header className="flex-shrink-0" />

        <AI>{children}</AI>
      </main>

      <Navbar className="static mx-auto mb-21/2 h-[64px] w-full max-w-full translate-x-0 translate-y-0 md:max-w-[400px]" />
    </>
  )
}
