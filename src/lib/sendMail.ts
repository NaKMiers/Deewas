import ResetPasswordEmail from '@/components/emails/ResetPasswordEmail'

import { render } from '@react-email/render'
import nodeMailer from 'nodemailer'

// Models: User
import '@/models/UserModel'

// SEND MAIL CORE
const transporter = nodeMailer.createTransport({
  service: 'gmail',
  secure: true,
  auth: {
    user: process.env.NEXT_PUBLIC_MAIL,
    pass: process.env.MAIL_APP_PASSWORD,
  },
})

export async function sendMail(to: string | string[], subject: string, html: string) {
  console.log('- Send Mail -')

  await transporter.sendMail({
    from: 'Deewas <no-reply@deewas.com>',
    to: to,
    subject: subject,
    html: html,
  })
}

// reset password email
export async function sendResetPasswordEmail(email: string, name: string, link: string) {
  console.log('- Send Reset Password Email -')

  try {
    const html = await render(
      ResetPasswordEmail({ name, resetLink: link, supportUrl: `mailto:${process.env.NEXT_PUBLIC_MAIL}` })
    )
    await sendMail(email, 'Reset password', html)
  } catch (err: any) {
    console.log(err)
  }
}
