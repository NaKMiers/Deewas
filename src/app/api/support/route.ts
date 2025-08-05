import { sendSupportEmail } from '@/lib/mailSending'
import { NextRequest, NextResponse } from 'next/server'

// [POST]: /api/support
export async function POST(req: NextRequest) {
  console.log('- Support -')

  try {
    // get data from request body
    const { name, email, subject, message } = await req.json()

    if (!name || !email || !message) {
      return NextResponse.json({ message: 'Please fill in all fields' }, { status: 400 })
    }

    // send support email to admin
    await sendSupportEmail(name, email, subject, message)

    // return response
    return NextResponse.json(
      { message: 'Your message has been sent successfully. Our team will get back to you shortly!' },
      { status: 200 }
    )
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 })
  }
}
