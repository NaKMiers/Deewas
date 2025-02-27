'use client'

import { SessionProvider } from 'next-auth/react'
import { ThemeProvider } from 'next-themes'
import { useRef } from 'react'
import { Provider } from 'react-redux'
import { AppStore, makeStore } from '../../lib/store'

function StoreProvider({ children, session }: { children: React.ReactNode; session: any }) {
  const storeRef = useRef<AppStore | null>(null)

  if (!storeRef.current) {
    storeRef.current = makeStore()
  }

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <Provider store={storeRef.current}>
        <SessionProvider
          session={session}
          refetchOnWindowFocus={false}
        >
          {children}
        </SessionProvider>
      </Provider>
    </ThemeProvider>
  )
}

export default StoreProvider
