import { Toaster } from 'react-hot-toast'
import { AI } from './actions'
import UseSettings from '@/components/UseSettings'

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <>
      <Toaster position="top-center" />
      <UseSettings />
      <AI>{children}</AI>
    </>
  )
}
