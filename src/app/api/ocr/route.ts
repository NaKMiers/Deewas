import { connectDatabase } from '@/config/database'
import { extractToken } from '@/lib/utils'
import CategoryModel from '@/models/CategoryModel'
import { openai } from '@ai-sdk/openai'
import { generateObject } from 'ai'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

export async function POST(req: NextRequest) {
  try {
    const token = await extractToken(req)
    const userId = token?._id

    // check if user is logged
    if (!userId) {
      return NextResponse.json({ message: 'Please login to continue' }, { status: 401 })
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

    // get user expense categories
    const expenseCategories = await CategoryModel.find({ user: userId, type: 'expense' })
      .select('name')
      .lean()

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

    console.log('OCR RESULT:', object)

    // return the extracted object for expense transaction
    return NextResponse.json({ ...object }, { status: 200 })
  } catch (err: any) {
    console.error('OCR ERROR:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
