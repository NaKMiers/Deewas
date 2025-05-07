import SupportEmail from '@/components/emails/SupportEmail'

function page() {
  return (
    <SupportEmail
      name="John"
      email="john@gmail.com"
      message="Hello, I need help with my account."
    />
  )
}

export default page
