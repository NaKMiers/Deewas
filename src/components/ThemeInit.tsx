'use client'

import { useTheme } from 'next-themes'
import { useEffect } from 'react'

function ThemeInit() {
  const { theme, setTheme } = useTheme()

  useEffect(() => {
    if (theme === 'light') {
      setTheme('dark')
      setTimeout(() => setTheme('light'), 0)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return null
}

export default ThemeInit
