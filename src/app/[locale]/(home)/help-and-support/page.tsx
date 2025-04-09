'use client'

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Link } from '@/i18n/navigation'
import { BookOpen, LifeBuoy, Mail, MessageSquare } from 'lucide-react' // Icon từ lucide-react

function HelpPage() {
  return (
    <div className="p-21/2 md:p-21">
      {/* Header */}
      <header className="py-10 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">Help & Support</h1>
        <p className="mt-2 text-lg text-muted-foreground">We’re here to assist you with Deewas!</p>
      </header>

      {/* Main Content */}
      <main className="container mx-auto py-12 sm:px-6 lg:px-8">
        {/* Quick Links */}
        <section className="mb-12">
          <h2 className="mb-6 text-center text-2xl font-semibold text-foreground">Quick Links</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-primary" />
                  User Guide
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Learn how to use Deewas with our detailed guide.
                </p>
                <Button
                  variant="link"
                  asChild
                  className="mt-2 p-0"
                >
                  <Link href="/help/guide">Read Guide</Link>
                </Button>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-primary" />
                  Contact Support
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Reach out to our team for personalized help.
                </p>
                <Button
                  variant="link"
                  asChild
                  className="mt-2 p-0"
                >
                  <Link href={`mailto:process.env.NEXT_PUBLIC_MAIL`}>Email Us</Link>
                </Button>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LifeBuoy className="h-5 w-5 text-primary" />
                  FAQ
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Find answers to common questions below.</p>
                <Button
                  variant="link"
                  asChild
                  className="mt-2 p-0"
                >
                  <Link href="#faq">View FAQ</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Separator */}
        <Separator className="my-12" />

        {/* FAQ */}
        <section
          id="faq"
          className="mb-12"
        >
          <h2 className="mb-6 text-center text-2xl font-semibold text-foreground">
            Frequently Asked Questions
          </h2>
          <Accordion
            type="single"
            collapsible
            className="mx-auto w-full max-w-3xl"
          >
            <AccordionItem value="item-1">
              <AccordionTrigger>How do I add a new transaction?</AccordionTrigger>
              <AccordionContent>
                Go to the Transactions page, click “Add Transaction,” and fill in the details like name,
                amount, and category. Our AI can also help via chat!
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger>Can I manage multiple wallets?</AccordionTrigger>
              <AccordionContent>
                Yes! Deewas supports multiple wallets. Add them in the Wallets section and track
                separately.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger>How do I set a budget?</AccordionTrigger>
              <AccordionContent>
                Navigate to Budgets, click “Create Budget,” and specify the category, total amount, and
                time range.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-4">
              <AccordionTrigger>What if I forget my password?</AccordionTrigger>
              <AccordionContent>
                Use the “Forgot Password” link on the login page to reset it via email.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </section>

        {/* Separator */}
        <Separator className="my-12" />

        {/* Contact Us */}
        <section className="text-center">
          <h2 className="mb-4 text-2xl font-semibold text-foreground">Still Need Help?</h2>
          <p className="mx-auto mb-6 max-w-xl text-muted-foreground">
            Our support team is available 24/7 to assist you. Drop us a message, and we’ll get back to
            you as soon as possible.
          </p>
          <Button
            asChild
            size="lg"
            className="bg-primary text-primary-foreground"
          >
            <Link href={`mailto:process.env.NEXT_PUBLIC_MAIL`}>
              <Mail className="mr-2 h-5 w-5" />
              Contact Support
            </Link>
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

export default HelpPage
