export const LANGUAGE_LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as const;

export type LanguageLevel = (typeof LANGUAGE_LEVELS)[number];

export interface RegionOption {
  code: string;
  label: string;
}

export interface LanguageOption {
  code: string;
  label: string;
  regions: RegionOption[];
}

export const LANGUAGES: LanguageOption[] = [
  {
    code: 'EN',
    label: 'English',
    regions: [
      { code: 'US', label: 'United States' },
      { code: 'GB', label: 'United Kingdom' },
      { code: 'CA', label: 'Canada' },
      { code: 'AU', label: 'Australia' },
      { code: 'IE', label: 'Ireland' },
      { code: 'NZ', label: 'New Zealand' },
    ],
  },
  {
    code: 'ES',
    label: 'Spanish',
    regions: [
      { code: 'ES', label: 'Spain' },
      { code: 'MX', label: 'Mexico' },
      { code: 'AR', label: 'Argentina' },
      { code: 'CO', label: 'Colombia' },
      { code: 'CL', label: 'Chile' },
      { code: 'PE', label: 'Peru' },
    ],
  },
  {
    code: 'FR',
    label: 'French',
    regions: [
      { code: 'FR', label: 'France' },
      { code: 'CA', label: 'Canada' },
      { code: 'BE', label: 'Belgium' },
      { code: 'CH', label: 'Switzerland' },
      { code: 'SN', label: 'Senegal' },
    ],
  },
  {
    code: 'DE',
    label: 'German',
    regions: [
      { code: 'DE', label: 'Germany' },
      { code: 'AT', label: 'Austria' },
      { code: 'CH', label: 'Switzerland' },
    ],
  },
  {
    code: 'IT',
    label: 'Italian',
    regions: [
      { code: 'IT', label: 'Italy' },
      { code: 'CH', label: 'Switzerland' },
    ],
  },
  {
    code: 'PT',
    label: 'Portuguese',
    regions: [
      { code: 'PT', label: 'Portugal' },
      { code: 'BR', label: 'Brazil' },
    ],
  },
  {
    code: 'JA',
    label: 'Japanese',
    regions: [{ code: 'JP', label: 'Japan' }],
  },
  {
    code: 'KO',
    label: 'Korean',
    regions: [{ code: 'KR', label: 'South Korea' }],
  },
  {
    code: 'ZH',
    label: 'Chinese',
    regions: [
      { code: 'CN', label: 'China' },
      { code: 'TW', label: 'Taiwan' },
      { code: 'HK', label: 'Hong Kong' },
    ],
  },
  {
    code: 'AR',
    label: 'Arabic',
    regions: [
      { code: 'SA', label: 'Saudi Arabia' },
      { code: 'EG', label: 'Egypt' },
      { code: 'AE', label: 'United Arab Emirates' },
      { code: 'MA', label: 'Morocco' },
      { code: 'LB', label: 'Lebanon' },
    ],
  },
  {
    code: 'RU',
    label: 'Russian',
    regions: [
      { code: 'RU', label: 'Russia' },
      { code: 'UA', label: 'Ukraine' },
      { code: 'KZ', label: 'Kazakhstan' },
    ],
  },
  {
    code: 'NL',
    label: 'Dutch',
    regions: [
      { code: 'NL', label: 'Netherlands' },
      { code: 'BE', label: 'Belgium' },
    ],
  },
  {
    code: 'TR',
    label: 'Turkish',
    regions: [{ code: 'TR', label: 'Turkey' }],
  },
  {
    code: 'HI',
    label: 'Hindi',
    regions: [{ code: 'IN', label: 'India' }],
  },
];

export function getLanguageByCode(code: string): LanguageOption | undefined {
  return LANGUAGES.find((language) => language.code === code);
}

export function getRegionsForLanguage(code: string): RegionOption[] {
  return getLanguageByCode(code)?.regions ?? [];
}

export function isRegionValidForLanguage(languageCode: string, regionCode: string): boolean {
  return getRegionsForLanguage(languageCode).some((region) => region.code === regionCode);
}

export function getDefaultRegionForLanguage(languageCode: string): string {
  return getRegionsForLanguage(languageCode)[0]?.code ?? '';
}
