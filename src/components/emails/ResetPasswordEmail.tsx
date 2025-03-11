import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Section,
  Tailwind,
  Text,
} from '@react-email/components'
import { theme } from '../../../tailwind.config'

interface ResetPasswordEmailProps {
  name: string
  resetLink: string
  supportUrl?: string
}

function ResetPasswordEmail({
  name,
  resetLink,
  supportUrl = `mailto:${process.env.NEXT_PUBLIC_MAIL}`,
}: ResetPasswordEmailProps) {
  return (
    <Html>
      <Head />
      <Tailwind
        config={{
          theme,
        }}
      >
        <Body className="bg-neutral-100 font-sans text-black">
          <Container className="mx-auto max-w-[400px] rounded-2xl border border-primary bg-white p-6">
            {/* Header */}
            <Section className="mb-6">
              <Heading className="text-center text-lg font-semibold">Password Reset Request</Heading>
              <Text className="text-center text-sm text-muted-foreground">For your Deewas account</Text>
            </Section>

            {/* Main Content */}
            <Section className="space-y-4">
              <Text>Hi {name},</Text>

              <Text>
                We received a request to reset your password on{' '}
                {new Intl.DateTimeFormat('en-US', {
                  dateStyle: 'full',
                  timeStyle: 'short',
                }).format(new Date())}
                .
              </Text>

              <Text>Click the button below to reset your password:</Text>

              <div className="text-center">
                <Link
                  href={resetLink}
                  className="inline-block rounded-md bg-neutral-900 px-6 py-3 text-sm font-medium text-white no-underline hover:bg-neutral-800"
                >
                  Reset Password
                </Link>
              </div>

              <Text className="text-sm text-muted-foreground">
                If you didn&apos;t request a password reset, please ignore this email or contact support
                if you have concerns.
              </Text>

              <Text>
                Need help?{' '}
                <Link
                  href={supportUrl}
                  className="text-primary hover:underline"
                >
                  Contact our support team
                </Link>
              </Text>

              <Text>
                Regards,
                <br />
                Deewas Team
              </Text>
            </Section>

            {/* Footer */}
            <Section className="mt-8 border-t border-slate-300 pt-4 text-center">
              <Text className="text-xs text-muted-foreground">
                © {new Date().getFullYear()} Deewas. All rights reserved.
              </Text>
              <div className="mt-2">
                <Link
                  href={process.env.NEXT_PUBLIC_APP_URL}
                  className="text-xs text-muted-foreground hover:text-primary"
                >
                  Visit our website
                </Link>
              </div>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  )
}

export default ResetPasswordEmail

// Preview function for development
export function ResetPasswordEmailPreview() {
  return (
    <ResetPasswordEmail
      name="John Doe"
      resetLink="https://yourapp.com/reset-password?token=abc123"
      supportUrl={`mailto:${process.env.NEXT_PUBLIC_MAIL}`}
    />
  )
}
