import { ReactNode } from 'react'
import './globals.scss'

export default async function RootLayout({
  children,
}: Readonly<{
  children: ReactNode
}>) {
  return children
}
