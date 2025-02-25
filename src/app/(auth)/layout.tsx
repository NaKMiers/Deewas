import PageLoading from '@/components/PageLoading'

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
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
