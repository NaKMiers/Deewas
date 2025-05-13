'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Link } from '@/i18n/navigation'
import { BarChart, LucideBrain, LucideChevronLeft, LucidePieChart, Wallet } from 'lucide-react'

function AboutPage() {
  return (
    <div className="min-h-screen p-6 md:p-12">
      <Link
        href="/"
        className="flex items-center"
      >
        <LucideChevronLeft size={20} />
        <span className="font-medium">Home</span>
      </Link>

      {/* Header */}
      <header className="py-10 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">About Deewas</h1>
        <p className="mt-2 text-lg text-muted-foreground">Your personal expense management companion</p>
      </header>

      {/* Main Content */}
      <main className="container mx-auto py-12 sm:px-6 lg:px-8">
        {/* Introduction */}
        <section className="mb-12 text-center">
          <h2 className="text-2xl font-semibold text-foreground">What is Deewas?</h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            Deewas is a modern, user-friendly app designed to help you track and manage your personal
            finances effortlessly. Whether it’s budgeting, tracking transactions, or managing wallets,
            Deewas has you covered.
          </p>
        </section>

        {/* Features */}
        <section className="mb-12">
          <h2 className="mb-6 text-center text-2xl font-semibold text-foreground">Key Features</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wallet className="h-5 w-5 text-primary" />
                  Multi-Wallet Support
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Manage multiple wallets seamlessly to keep your finances organized.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart className="h-5 w-5 text-primary" />
                  Insightful Charts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Visualize your spending with beautiful, interactive charts.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LucidePieChart className="h-5 w-5 text-primary" />
                  Budget Planning
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Set budgets and stay on top of your financial goals.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LucideBrain className="h-5 w-5 text-primary" />
                  Smart AI Assistant
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Get help from our AI to manage transactions effortlessly.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Separator */}
        <Separator className="my-12" />

        {/* Mission */}
        <section className="mb-12 text-center">
          <h2 className="text-2xl font-semibold text-foreground">Our Mission</h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            At Deewas, we aim to empower individuals to take control of their finances with intuitive
            tools and smart insights, making money management simple and stress-free.
          </p>
        </section>

        {/* CTA */}
        <section className="text-center">
          <h2 className="mb-4 text-2xl font-semibold text-foreground">Ready to Get Started?</h2>
          <p className="mb-6 text-muted-foreground">
            Join thousands of users who trust Deewas to manage their expenses.
          </p>
          <Button
            asChild
            size="lg"
            className="bg-primary text-primary-foreground"
          >
            <Link href="/">Start Now</Link>
          </Button>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-muted-foreground">
        <p className="text-sm">© {new Date().getFullYear()} Deewas. All rights reserved.</p>
      </footer>
    </div>
  )
}

export default AboutPage
