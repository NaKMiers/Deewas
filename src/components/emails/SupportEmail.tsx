import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Section,
  Tailwind,
  Text,
} from '@react-email/components'
import { theme } from '../../../tailwind.config'

interface SupportEmailProps {
  name: string
  email: string
  subject?: string
  message: string
}

function SupportEmail({ name, email, subject, message }: SupportEmailProps) {
  return (
    <Html>
      <Head />
      <Tailwind config={{ theme }}>
        <Body className="bg-neutral-100 font-sans text-black">
          <Container className="mx-auto max-w-xl rounded-2xl border border-primary bg-white p-6">
            <Section className="mb-6">
              <Heading className="text-lg font-semibold text-primary">
                {subject || 'New Support Request'}
              </Heading>
              <Text className="text-sm text-muted-foreground">
                You’ve received a new support message via the Deewas Help Center.
              </Text>
            </Section>

            <Section className="space-y-4">
              <Hr />
              <Text className="text-sm font-medium uppercase text-muted-foreground">Sender Info</Text>
              <Text>
                <strong>Name:</strong> {name}
                <br />
                <strong>Email:</strong> {email}
              </Text>

              <Text className="text-sm font-medium uppercase text-muted-foreground">Message</Text>
              <Text className="whitespace-pre-line">{message}</Text>

              <Hr />
              <Text className="text-xs text-muted-foreground">
                This message was sent on{' '}
                {new Intl.DateTimeFormat('en-US', {
                  dateStyle: 'full',
                  timeStyle: 'short',
                }).format(new Date())}
                .
              </Text>
            </Section>

            <Section className="mt-8 border-t border-slate-300 pt-4 text-center">
              <Text className="text-xs text-muted-foreground">
                © {new Date().getFullYear()} Deewas. All rights reserved.
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  )
}

export default SupportEmail

// Optional preview
export function SupportEmailPreview() {
  return (
    <SupportEmail
      name="Jane Smith"
      email="jane@example.com"
      message="I can't seem to add a new wallet. Please help!"
    />
  )
}
