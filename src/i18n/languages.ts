export const SUPPORTED_LANGUAGES = [
  'en',
  'ar',
  'es',
  'fr',
  'de',
  'it',
  'pt',
  'ja',
  'ko',
  'zh',
  'ru',
  'nl',
  'tr',
  'hi',
] as const;

export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

/** Native names shown in the language picker (same across locales). */
export const LANGUAGE_NATIVE_NAMES: Record<SupportedLanguage, string> = {
  en: 'English',
  ar: 'العربية',
  es: 'Español',
  fr: 'Français',
  de: 'Deutsch',
  it: 'Italiano',
  pt: 'Português',
  ja: '日本語',
  ko: '한국어',
  zh: '中文',
  ru: 'Русский',
  nl: 'Nederlands',
  tr: 'Türkçe',
  hi: 'हिन्दी',
};

export function isSupportedLanguage(value: string): value is SupportedLanguage {
  return (SUPPORTED_LANGUAGES as readonly string[]).includes(value);
}

export function normalizeLanguage(language: string): SupportedLanguage {
  const base = language.split('-')[0]?.toLowerCase() ?? 'en';
  return isSupportedLanguage(base) ? base : 'en';
}
