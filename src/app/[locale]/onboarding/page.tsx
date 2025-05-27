'use client'

import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { useRouter } from '@/i18n/navigation'
import { checkPremium } from '@/lib/utils'
import { Check, X } from 'lucide-react'
import { signOut, useSession } from 'next-auth/react'
import Image from 'next/image'
import Link from 'next/link'

const freeFeatures = [
  'Max 2 wallets',
  'Max 4 budgets',
  'Annoying ads',
  '10.000 AI tokens every day',
  "Can't export data",
  'Bar chart only',
  'Mobile only',
]

const premiumFeatures = [
  'Unlimited wallets',
  'Unlimited budgets',
  'No advertisement',
  'Up to 4.500.000 AI tokens per month',
  'Export data to CSV, Excel',
  'Unlock advanced charts (pie, line, bar, etc.)',
  'Mobile and web',
]

function OnboardingPage() {
  const { data: session } = useSession()
  const user: any = session?.user
  const router = useRouter()

  return (
    <div className="container mx-auto p-8">
      <div className="flex flex-row justify-end">
        <Button
          variant="default"
          className="shadow-md"
          onClick={() => (user ? signOut() : router.push('/auth/sign-in'))}
        >
          {user ? 'Log out' : 'Sign in'}
        </Button>
      </div>

      {/* MARK: Hero Section */}
      <section className="mb-12 text-center">
        <h1 className="mb-4 text-4xl font-bold">Welcome to Deewas</h1>
        <p className="text-lg text-gray-300">Discover the best experience with our app!</p>
        <div className="mt-6 space-x-4">
          <Button asChild>
            <Link href={process.env.NEXT_PUBLIC_APPSTORE_URL!}>Download on App Store</Link>
          </Button>
          <Button asChild>
            <Link href={process.env.NEXT_PUBLIC_PLAYSTORE_URL!}>Get it on Google Play</Link>
          </Button>
        </div>
      </section>

      {/* MARK: Introduction */}
      <section className="flex flex-col items-center p-4 pb-21">
        <div className="show-lg aspect-square max-w-[150px] rounded-lg bg-white">
          <Image
            src="/images/pre-logo.png"
            width={200}
            height={200}
            alt="pre-bg"
            className="h-full w-full object-contain"
          />
        </div>

        <p className="mt-1 text-center font-body text-lg tracking-wider">
          Unlock premium to access all powerful features!
        </p>
      </section>

      {/* MARK: Comparisons Section */}
      <section className="my-12">
        <h2 className="mb-6 text-center text-3xl font-semibold">Compare Plans</h2>
        <div className="mx-auto flex w-full max-w-2xl flex-row items-start justify-center gap-1.5 px-2.5 md:gap-5">
          {/* Free Features */}
          <div className="mt-7 w-1/2 rounded-lg border border-gray-300 bg-gray-100 py-5 shadow-lg">
            <h3 className="text-center text-2xl font-bold text-gray-800">FREE</h3>
            <div className="mt-3 space-y-2 px-2">
              {freeFeatures.map((feature, index) => (
                <div
                  key={index}
                  className="flex flex-row items-center gap-2"
                >
                  <X
                    size={20}
                    color="#ccc"
                  />
                  <p className="flex-1 font-medium text-gray-700">{feature}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Premium Features */}
          <div className="w-1/2 rounded-lg border border-sky-500 bg-white py-12 shadow-lg">
            <h3 className="text-center text-2xl font-bold text-sky-500">PREMIUM</h3>
            <div className="mt-3 space-y-2 px-2">
              {premiumFeatures.map((feature, index) => (
                <div
                  key={index}
                  className="flex flex-row items-center gap-2"
                >
                  <Check
                    size={20}
                    color="#ec4899"
                  />
                  <p className="flex-1 font-medium text-black">{feature}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* MARK: Onboarding  */}
      <section className="text-center">
        <h2 className="mb-4 text-2xl font-semibold">Get Started</h2>
        {checkPremium(user) ? (
          <div>
            <p className="mb-4 text-green-600">You are a Premium user! Enjoy full access.</p>
            <Button asChild>
              <Link href="/">Explore Now</Link>
            </Button>
          </div>
        ) : (
          <div>
            <div className="mb-4">
              <p className="text-rose-500">Premium required to unlock web features.</p>
              <p>Download the app to get started.</p>
            </div>
            <div className="mt-2 space-x-4">
              <Button asChild>
                <Link href="https://www.apple.com/app-store/">App Store</Link>
              </Button>
              <Button asChild>
                <Link href="https://play.google.com/store">Google Play</Link>
              </Button>
            </div>
          </div>
        )}
      </section>

      <Separator className="my-16 h-0" />
    </div>
  )
}

export default OnboardingPage
