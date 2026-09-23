export const SUPPORTED_LANGUAGES = ['en', 'ar'] as const;

export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

export function isSupportedLanguage(value: string): value is SupportedLanguage {
  return (SUPPORTED_LANGUAGES as readonly string[]).includes(value);
}

export function getAlternateLanguage(current: string): SupportedLanguage {
  return current.startsWith('ar') ? 'en' : 'ar';
}
