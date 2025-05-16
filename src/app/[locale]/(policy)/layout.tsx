import { Button } from '@/components/ui/button'
import { Link } from '@/i18n/navigation'
import { ReactNode } from 'react'

export default async function RootLayout({
  children,
}: Readonly<{
  children: ReactNode
}>) {
  return (
    <main>
      <header className="fixed left-0 right-0 top-0 z-50 bg-secondary shadow-sm backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-21 px-4 py-4 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="text-2xl font-bold text-primary"
          >
            Deewas
          </Link>
          <nav className="flex items-center">
            <Link href="/privacy-policy">
              <Button
                variant="ghost"
                className="px-2"
              >
                Privacy Policy
              </Button>
            </Link>
            <Link href="/terms-and-conditions">
              <Button
                variant="ghost"
                className="px-2"
              >
                Terms & Conditions
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      {children}

      <footer className="mt-12 bg-secondary text-primary">
        <div className="mx-auto max-w-7xl px-4 py-6 text-center sm:px-6 lg:px-8">
          <p className="text-gray-500 dark:text-gray-400">
            © {new Date().getFullYear()} Deewas. All rights reserved. | Contact us at{' '}
            <a
              href="mailto:deewas.now@gmail.com"
              className="text-sky-500 hover:underline"
            >
              deewas.now@gmail.com
            </a>
          </p>
        </div>
      </footer>
    </main>
  )
}
