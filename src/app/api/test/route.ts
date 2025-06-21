import { connectDatabase } from '@/config/database'
import { NextRequest, NextResponse } from 'next/server'

// [GET]: /test
export async function GET(req: NextRequest) {
  console.log('Test API')

  try {
    // const locale = 'vi'

    // const messages = getMessagesByLocale(locale)
    // const t = createTranslator({ locale, messages, namespace: 'categories' })

    // let translatedCategories: any = {}
    // for (const type in initCategories) {
    //   const categories = (initCategories as any)[type].map((cate: any) => ({
    //     ...cate,
    //     name: t(cate.name),
    //   }))

    //   translatedCategories[type] = categories
    // }

    // connect to database
    await connectDatabase()

    // return response
    return NextResponse.json({ message: '' }, { status: 200 })
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 })
  }
}
