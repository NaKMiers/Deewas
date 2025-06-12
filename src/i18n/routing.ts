import { defineRouting } from 'next-intl/routing'

export const routing = defineRouting({
  // A list of all locales that are supported
  locales: [
    'ar',
    'bn',
    'de',
    'en',
    'es',
    'fr',
    'gu',
    'hi',
    'id',
    'it',
    'ja',
    'kn',
    'ko',
    'ml',
    'ms',
    'nl',
    'pt',
    'ru',
    'ta',
    'te',
    'th',
    'tr',
    'ur',
    'vi',
    'zh-Hant',
    'zh',
  ],

  // Used when no locale matches
  defaultLocale: 'en',
})
