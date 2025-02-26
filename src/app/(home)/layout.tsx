import Header from '@/components/Header'
import Navbar from '@/components/Navbar'
import PageLoading from '@/components/PageLoading'
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

      {/* Main */}
      <main className="h-[calc(100vh-50px)] overflow-y-auto">
        <Header />

        {children}
      </main>

      <Navbar />
    </>
  )
}
