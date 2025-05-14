import { Link } from '@/i18n/navigation'

function NotFoundPage() {
  return (
    <html>
      <body className="min-w-screen flex min-h-screen items-center justify-center">
        <section className="bg-white">
          <div className="mx-auto max-w-screen-xl px-4 py-8 lg:px-6 lg:py-16">
            <div className="mx-auto max-w-screen-sm text-center">
              <h1 className="text-primary-600 mb-4 text-7xl font-extrabold tracking-tight lg:text-9xl">
                404
              </h1>
              <p className="mb-4 text-3xl font-bold tracking-tight text-gray-900 md:text-4xl">
                Something&apos;s missing.
              </p>
              <p className="mb-4 text-lg font-light text-gray-500">
                Sorry, we can&apos;t find that page. You&apos;ll find lots to explore on the home
                page.{' '}
              </p>
              <Link
                href="/"
                className="hover:bg-primary-800 my-4 inline-flex rounded-lg bg-gray-900 px-5 py-2.5 text-center text-sm font-medium text-white"
              >
                Back to Homepage
              </Link>
            </div>
          </div>
        </section>
      </body>
    </html>
  )
}

export default NotFoundPage
