import { connectDatabase } from '@/config/database'
import { checkPremium, extractToken } from '@/lib/utils'
import CategoryModel from '@/models/CategoryModel'
import SettingsModel from '@/models/SettingsModel'
import { openai } from '@ai-sdk/openai'
import { generateObject } from 'ai'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

// Models: Category, Settings
import '@/models/CategoryModel'
import '@/models/SettingsModel'
import { Settings } from 'http2'

// [POST]: /ocr
export async function POST(req: NextRequest) {
  try {
    const token = await extractToken(req)
    const userId = token?._id

    // check if user is logged
    if (!userId) {
      return NextResponse.json({ message: 'Please login to continue' }, { status: 401 })
    }

    const isPremium = checkPremium(token)

    // only allow free users scan 3 receipts/day
    if (!isPremium) {
      const userScanned: any = await SettingsModel.findOne({ user: userId }).select('scanned').lean()
      if (!userScanned || userScanned.scanned >= 3) {
        return NextResponse.json(
          {
            errorCode: 'SCANNING_LIMIT_REACHED',
            message:
              'You have reached your daily limit of scanning receipts, please upgrade to premium to continue scanning',
          },
          { status: 402 }
        )
      }
    }

    // get file from form data
    const formData = await req.formData()
    const imageFile: File = formData.get('image') as File

    // check if file is provided
    if (!imageFile) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }

    // convert file to base64
    const arrayBuffer = await imageFile.arrayBuffer()
    const base64 = Buffer.from(arrayBuffer).toString('base64')

    // extract text from image using Google Vision API
    const res = await fetch(
      `https://vision.googleapis.com/v1/images:annotate?key=${process.env.GOOGLE_VISION_API_KEY}`,
      {
        method: 'POST',
        body: JSON.stringify({
          requests: [
            {
              image: { content: base64 },
              features: [{ type: 'DOCUMENT_TEXT_DETECTION' }],
            },
          ],
        }),
      }
    )
    const visionData = await res.json()
    const receiptText = visionData.responses?.[0]?.fullTextAnnotation?.text ?? ''

    // connect database
    await connectDatabase()

    const [expenseCategories] = await Promise.all([
      // get user expense categories
      CategoryModel.find({ user: userId, type: 'expense' }).select('name').lean(),
      // increment scanned count for user
      SettingsModel.findOneAndUpdate({ user: userId }, { $inc: { scanned: 1 } }),
    ])

    const { object } = await generateObject({
      model: openai('gpt-4o-mini'),
      system: 'Extract receipt info and choose the correct category from the list provided',
      schema: z.object({
        name: z.string(),
        amount: z.number(),
        date: z.string().transform(val => new Date(val).toISOString()),
        category: z
          .object({
            _id: z.string().describe('category id from provider list'),
            name: z.string().describe('category name from provider list'),
          })
          .describe('selected category from provider list'),
      }),
      prompt: `"""${receiptText}""", ${JSON.stringify(expenseCategories)}`,
    })

    // return the extracted object for expense transaction
    return NextResponse.json({ ...object }, { status: 200 })
  } catch (err: any) {
    console.error('OCR ERROR:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
