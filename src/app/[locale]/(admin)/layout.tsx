import Header from '@/components/Header'
import Navbar from '@/components/Navbar'
import PageLoading from '@/components/PageLoading'
import Sidebar from '@/components/Sidebar'
import { ReactNode } from 'react'

export default async function RootLayout({
  children,
}: Readonly<{
  children: ReactNode
}>) {
  return (
    <>
      <PageLoading />

      {/* Main */}
      <main>
        <Header />
        <div className="flex">
          <Sidebar />

          <div className="flex-1">
            <div className="flex-1">{children}</div>
          </div>
        </div>
      </main>

      <Navbar />
    </>
  )
}
