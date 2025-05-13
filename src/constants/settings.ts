export type CurrencyType = {
  value: string
  label: string
  symbol: string
  locale: string
}

export const currencies: CurrencyType[] = [
  { value: 'USD', label: 'US Dollar ($)', symbol: '$', locale: 'en-US' },
  { value: 'EUR', label: 'Euro (€)', symbol: '€', locale: 'de-DE' },
  { value: 'JPY', label: 'Japanese Yen (¥)', symbol: '¥', locale: 'ja-JP' },
  { value: 'GBP', label: 'British Pound (£)', symbol: '£', locale: 'en-GB' },
  { value: 'AUD', label: 'Australian Dollar (A$)', symbol: 'A$', locale: 'en-AU' },
  { value: 'CAD', label: 'Canadian Dollar (C$)', symbol: 'C$', locale: 'en-CA' },
  { value: 'CHF', label: 'Swiss Franc (CHF)', symbol: 'CHF', locale: 'fr-CH' },
  { value: 'CNY', label: 'Chinese Yuan (¥)', symbol: '¥', locale: 'zh-CN' },
  { value: 'SEK', label: 'Swedish Krona (kr)', symbol: 'kr', locale: 'sv-SE' },
  { value: 'NZD', label: 'New Zealand Dollar (NZ$)', symbol: 'NZ$', locale: 'en-NZ' },
  { value: 'MXN', label: 'Mexican Peso (Mex$)', symbol: 'Mex$', locale: 'es-MX' },
  { value: 'SGD', label: 'Singapore Dollar (S$)', symbol: 'S$', locale: 'en-SG' },
  { value: 'HKD', label: 'Hong Kong Dollar (HK$)', symbol: 'HK$', locale: 'zh-HK' },
  { value: 'NOK', label: 'Norwegian Krone (kr)', symbol: 'kr', locale: 'nb-NO' },
  { value: 'KRW', label: 'South Korean Won (₩)', symbol: '₩', locale: 'ko-KR' },
  { value: 'TRY', label: 'Turkish Lira (₺)', symbol: '₺', locale: 'tr-TR' },
  { value: 'RUB', label: 'Russian Ruble (₽)', symbol: '₽', locale: 'ru-RU' },
  { value: 'INR', label: 'Indian Rupee (₹)', symbol: '₹', locale: 'hi-IN' },
  { value: 'BRL', label: 'Brazilian Real (R$)', symbol: 'R$', locale: 'pt-BR' },
  { value: 'ZAR', label: 'South African Rand (R)', symbol: 'R', locale: 'en-ZA' },
  { value: 'PHP', label: 'Philippine Peso (₱)', symbol: '₱', locale: 'tl-PH' },
  { value: 'IDR', label: 'Indonesian Rupiah (Rp)', symbol: 'Rp', locale: 'id-ID' },
  { value: 'MYR', label: 'Malaysian Ringgit (RM)', symbol: 'RM', locale: 'ms-MY' },
  { value: 'THB', label: 'Thai Baht (฿)', symbol: '฿', locale: 'th-TH' },
  { value: 'AED', label: 'UAE Dirham (د.إ)', symbol: 'د.إ', locale: 'ar-AE' },
  { value: 'ARS', label: 'Argentine Peso (ARS$)', symbol: 'ARS$', locale: 'es-AR' },
  { value: 'CLP', label: 'Chilean Peso (CLP$)', symbol: 'CLP$', locale: 'es-CL' },
  { value: 'COP', label: 'Colombian Peso (COP$)', symbol: 'COP$', locale: 'es-CO' },
  { value: 'EGP', label: 'Egyptian Pound (E£)', symbol: 'E£', locale: 'ar-EG' },
  { value: 'VND', label: 'Vietnamese Dong (₫)', symbol: '₫', locale: 'vi-VN' },
  { value: 'KZT', label: 'Kazakhstani Tenge (₸)', symbol: '₸', locale: 'kk-KZ' },
  { value: 'NGN', label: 'Nigerian Naira (₦)', symbol: '₦', locale: 'en-NG' },
  { value: 'PKR', label: 'Pakistani Rupee (₨)', symbol: '₨', locale: 'ur-PK' },
  { value: 'BDT', label: 'Bangladeshi Taka (৳)', symbol: '৳', locale: 'bn-BD' },
  { value: 'UAH', label: 'Ukrainian Hryvnia (₴)', symbol: '₴', locale: 'uk-UA' },
  { value: 'IQD', label: 'Iraqi Dinar (ع.د)', symbol: 'ع.د', locale: 'ar-IQ' },
  { value: 'QAR', label: 'Qatari Riyal (ر.ق)', symbol: 'ر.ق', locale: 'ar-QA' },
  { value: 'SAR', label: 'Saudi Riyal (﷼)', symbol: '﷼', locale: 'ar-SA' },
  { value: 'KWD', label: 'Kuwaiti Dinar (KD)', symbol: 'KD', locale: 'ar-KW' },
  { value: 'BHD', label: 'Bahraini Dinar (BD)', symbol: 'BD', locale: 'ar-BH' },
  { value: 'OMR', label: 'Omani Rial (﷼)', symbol: '﷼', locale: 'ar-OM' },
  { value: 'DZD', label: 'Algerian Dinar (د.ج)', symbol: 'د.ج', locale: 'ar-DZ' },
  { value: 'MAD', label: 'Moroccan Dirham (د.م.)', symbol: 'د.م.', locale: 'ar-MA' },
  { value: 'LBP', label: 'Lebanese Pound (ل.ل)', symbol: 'ل.ل', locale: 'ar-LB' },
  { value: 'SDG', label: 'Sudanese Pound (ج.س)', symbol: 'ج.س', locale: 'ar-SD' },
  { value: 'KES', label: 'Kenyan Shilling (KSh)', symbol: 'KSh', locale: 'sw-KE' },
  { value: 'TZS', label: 'Tanzanian Shilling (TSh)', symbol: 'TSh', locale: 'sw-TZ' },
  { value: 'UGX', label: 'Ugandan Shilling (USh)', symbol: 'USh', locale: 'sw-UG' },
  { value: 'GHS', label: 'Ghanaian Cedi (₵)', symbol: '₵', locale: 'en-GH' },
  { value: 'XAF', label: 'Central African CFA Franc (FCFA)', symbol: 'FCFA', locale: 'fr-CM' },
  { value: 'XOF', label: 'West African CFA Franc (CFA)', symbol: 'CFA', locale: 'fr-BJ' },
  { value: 'CDF', label: 'Congolese Franc (FC)', symbol: 'FC', locale: 'fr-CD' },
  { value: 'MZN', label: 'Mozambican Metical (MT)', symbol: 'MT', locale: 'pt-MZ' },
  { value: 'ETB', label: 'Ethiopian Birr (Br)', symbol: 'Br', locale: 'am-ET' },
]

export const defaultCurrency = currencies.find(c => c.value === 'USD') || currencies[0]

export type LanguageType = {
  value: string
  label: string
  alternative: string
}

export const languages: LanguageType[] = [
  { value: 'en', label: 'English', alternative: 'English' },
  { value: 'zh', label: '简体中文', alternative: 'Chinese (Simplified)' },
  { value: 'hi', label: 'हिन्दी', alternative: 'Hindi' },
  { value: 'es', label: 'Español', alternative: 'Spanish' },
  { value: 'ar', label: 'العربية', alternative: 'Arabic' },
  { value: 'bn', label: 'বাংলা', alternative: 'Bengali' },
  { value: 'pt', label: 'Português', alternative: 'Portuguese' },
  { value: 'ru', label: 'Русский', alternative: 'Russian' },
  { value: 'ur', label: 'اردو', alternative: 'Urdu' },
  { value: 'id', label: 'Bahasa Indonesia', alternative: 'Indonesian' },
  { value: 'de', label: 'Deutsch', alternative: 'German' },
  { value: 'ja', label: '日本語', alternative: 'Japanese' },
  { value: 'fr', label: 'Français', alternative: 'French' },
  { value: 'te', label: 'తెలుగు', alternative: 'Telugu' },
  { value: 'ta', label: 'தமிழ்', alternative: 'Tamil' },
  { value: 'ko', label: '한국어', alternative: 'Korean' },
  { value: 'tr', label: 'Türkçe', alternative: 'Turkish' },
  { value: 'ml', label: 'മലയാളം', alternative: 'Malayalam' },
  { value: 'vi', label: 'Tiếng Việt', alternative: 'Vietnamese' },
  { value: 'it', label: 'Italiano', alternative: 'Italian' },
  { value: 'th', label: 'ไทย', alternative: 'Thai' },
  { value: 'gu', label: 'ગુજરાતી', alternative: 'Gujarati' },
  { value: 'kn', label: 'ಕನ್ನಡ', alternative: 'Kannada' },
  { value: 'ms', label: 'Bahasa Melayu', alternative: 'Malay' },
  { value: 'nl', label: 'Nederlands', alternative: 'Dutch' },
]

export const defaultLanguage = languages.find(l => l.value === 'en') || languages[0]
