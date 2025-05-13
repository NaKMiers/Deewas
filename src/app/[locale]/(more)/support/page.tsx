'use client'

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Link } from '@/i18n/navigation'
import { sendSupportFormApi } from '@/requests'
import {
  BookOpen,
  FileText,
  LifeBuoy,
  LucideChevronLeft,
  Mail,
  MessageSquare,
  Shield,
} from 'lucide-react'
import { useCallback, useState } from 'react'
import { FieldValues, SubmitHandler, useForm } from 'react-hook-form'
import toast from 'react-hot-toast'

const faqData = [
  {
    id: 'item-1',
    question: 'How do I add a new transaction?',
    answer:
      'Go to the Transactions page, click “Add Transaction,” and fill in the details like name, amount, and category. Our AI can also help via chat!',
  },
  {
    id: 'item-2',
    question: 'Can I manage multiple wallets?',
    answer:
      'Yes! Deewas supports multiple wallets. Add them in the Wallets section and track separately.',
  },
  {
    id: 'item-3',
    question: 'How do I set a budget?',
    answer:
      'Navigate to Budgets, click “Create Budget,” and specify the category, total amount, and time range.',
  },
  {
    id: 'item-4',
    question: 'What if I forget my password?',
    answer: 'Use the “Forgot Password” link on the login page to reset it via email.',
  },
  {
    id: 'item-5',
    question: 'How do I change the app’s language or currency?',
    answer: 'You can adjust language and currency from the Settings > Preferences section.',
  },
]

export default function HelpPage() {
  // states
  const [search, setSearch] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(false)
  const filteredFaqs = faqData.filter(
    f =>
      f.question.toLowerCase().includes(search.toLowerCase()) ||
      f.answer.toLowerCase().includes(search.toLowerCase())
  )

  // form
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FieldValues>({
    defaultValues: {
      name: '',
      email: '',
      message: '',
    },
  })

  // MARK: Send support form
  const sendSupportForm: SubmitHandler<FieldValues> = useCallback(async data => {
    setLoading(true)
    toast.loading('Sending message' + '...', { id: 'support-message' })

    try {
      // send request to server
      const { message } = await sendSupportFormApi(data)
      toast.success(message, { id: 'support-message' })
    } catch (err: any) {
      toast.error(err.message, { id: 'support-message' })
      console.error(err)
    } finally {
      // stop loading
      setLoading(false)
    }
  }, [])

  return (
    <div className="min-h-screen p-6 md:p-12">
      <Link
        href="/"
        className="flex items-center"
      >
        <LucideChevronLeft size={20} />
        <span className="font-medium">Home</span>
      </Link>

      <header className="py-10 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">Help & Support</h1>
        <p className="mt-2 text-lg text-muted-foreground">We’re here to assist you with Deewas!</p>
      </header>

      <main className="container mx-auto space-y-20 py-12">
        {/* MARK: Quick Links */}
        <section>
          <h2 className="mb-6 text-center text-2xl font-semibold">Quick Links</h2>
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
                  <Link href={`mailto:${process.env.NEXT_PUBLIC_MAIL}`}>Email Us</Link>
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
                <p className="text-sm text-muted-foreground">Common questions and answers.</p>
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

        <Separator />

        {/* MARK: Send Message */}
        <section className="mx-auto max-w-2xl space-y-6 py-12">
          <h2 className="text-center text-2xl font-semibold">Send us a Message</h2>
          <form
            className="space-y-4"
            onSubmit={handleSubmit(sendSupportForm)}
          >
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-foreground"
              >
                Name
              </label>
              <Input
                id="name"
                required
                {...register('name', { required: true })}
                placeholder="Your name"
                className="mt-1 border-primary/10 bg-secondary/50"
              />
            </div>
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-foreground"
              >
                Email
              </label>
              <Input
                id="email"
                type="email"
                required
                placeholder="you@example.com"
                {...register('email', { required: true })}
                className="mt-1 border-primary/10 bg-secondary/50"
              />
            </div>
            <div>
              <label
                htmlFor="message"
                className="block text-sm font-medium text-foreground"
              >
                Message
              </label>
              <textarea
                id="message"
                required
                rows={5}
                placeholder="How can we help you?"
                {...register('message', { required: true })}
                className="mt-1 w-full rounded-md border border-primary/10 bg-secondary/50 p-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? 'Sending...' : 'Send Message'}
            </Button>
          </form>
        </section>

        <Separator />

        {/* MARK: FAQ with Search */}
        <section id="faq">
          <h2 className="mb-4 text-center text-2xl font-semibold">Frequently Asked Questions</h2>
          <div className="mx-auto mb-6 max-w-2xl">
            <Input
              placeholder="Search FAQs..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <Accordion
            type="single"
            collapsible
            className="mx-auto w-full max-w-3xl"
          >
            {filteredFaqs.map(({ id, question, answer }) => (
              <AccordionItem
                key={id}
                value={id}
              >
                <AccordionTrigger>{question}</AccordionTrigger>
                <AccordionContent>{answer}</AccordionContent>
              </AccordionItem>
            ))}
            {filteredFaqs.length === 0 && (
              <p className="text-center text-muted-foreground">No matching results.</p>
            )}
          </Accordion>
        </section>

        <Separator />

        {/* MARK: Troubleshooting Section */}
        <section>
          <h2 className="mb-6 text-center text-2xl font-semibold">Troubleshooting</h2>
          <div className="mx-auto max-w-3xl space-y-4 text-sm text-muted-foreground">
            <div>
              <strong className="text-foreground">App not syncing data?</strong> — Make sure you are
              connected to the internet. Try refreshing the app or logging out and back in.
            </div>
            <div>
              <strong className="text-foreground">Payment issues?</strong> — Ensure your subscription is
              active. If you purchased via App Store/Google Play, try restoring purchases in Settings.
            </div>
            <div>
              <strong className="text-foreground">AI not responding?</strong> — Sometimes the assistant
              may be busy. Try again after a few seconds, or clear cache and retry.
            </div>
          </div>
        </section>

        <Separator />

        {/* External Policies */}
        <section className="space-y-2 text-center">
          <h2 className="text-2xl font-semibold">More Resources</h2>
          <div className="mt-4 flex justify-center gap-6">
            <Link
              href="/privacy-policy"
              className="flex items-center gap-1 text-sm text-primary underline"
            >
              <Shield className="h-4 w-4" />
              Privacy Policy
            </Link>
            <Link
              href="/terms-and-conditions"
              className="flex items-center gap-1 text-sm text-primary underline"
            >
              <FileText className="h-4 w-4" />
              Terms and Conditions
            </Link>
          </div>
        </section>

        {/* Contact Final CTA */}
        <section className="pt-20 text-center">
          <h2 className="mb-4 text-2xl font-semibold">Still Need Help?</h2>
          <p className="mx-auto mb-6 max-w-xl text-muted-foreground">
            Our support team is available 24/7. Email us and we&apos;ll respond shortly.
          </p>
          <Button
            asChild
            size="lg"
            className="bg-primary text-primary-foreground"
          >
            <Link href={`mailto:${process.env.NEXT_PUBLIC_MAIL}`}>
              <Mail className="mr-2 h-5 w-5" />
              Contact Support
            </Link>
          </Button>
        </section>
      </main>

      <footer className="py-6 text-center text-muted-foreground">
        <p className="text-sm">© {new Date().getFullYear()} Deewas. All rights reserved.</p>
      </footer>
    </div>
  )
}
