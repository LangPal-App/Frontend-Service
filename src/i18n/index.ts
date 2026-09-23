import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';
import { SUPPORTED_LANGUAGES } from './languages';

const namespaces = ['common', 'home', 'auth', 'pals', 'chat', 'settings'] as const;

type LocaleModule = { default: Record<string, unknown> };

const localeModules = import.meta.glob<LocaleModule>('../locales/*/*.json', { eager: true });

function buildResources() {
  const resources: Record<string, Record<string, Record<string, unknown>>> = {};

  for (const [path, mod] of Object.entries(localeModules)) {
    const match = path.match(/\/locales\/([^/]+)\/([^/]+)\.json$/);
    if (!match) continue;
    const [, lng, ns] = match;
    if (!resources[lng]) resources[lng] = {};
    resources[lng][ns] = mod.default;
  }

  return resources;
}

function applyDocumentMeta(language: string) {
  const dir = i18n.t('dir', { lng: language, ns: 'common' });
  document.documentElement.lang = language;
  document.documentElement.dir = dir === 'rtl' ? 'rtl' : 'ltr';
}

void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: buildResources(),
    supportedLngs: [...SUPPORTED_LANGUAGES],
    fallbackLng: 'en',
    defaultNS: 'common',
    ns: [...namespaces],
    interpolation: { escapeValue: false },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
  });

i18n.on('languageChanged', applyDocumentMeta);

if (i18n.isInitialized) {
  applyDocumentMeta(i18n.language);
} else {
  i18n.on('initialized', () => applyDocumentMeta(i18n.language));
}

export default i18n;
