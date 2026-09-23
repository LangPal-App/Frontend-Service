import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';
import { SUPPORTED_LANGUAGES } from './languages';

import enCommon from '../locales/en/common.json';
import enHome from '../locales/en/home.json';
import enAuth from '../locales/en/auth.json';
import enPals from '../locales/en/pals.json';
import enChat from '../locales/en/chat.json';
import enSettings from '../locales/en/settings.json';

import arCommon from '../locales/ar/common.json';
import arHome from '../locales/ar/home.json';
import arAuth from '../locales/ar/auth.json';
import arPals from '../locales/ar/pals.json';
import arChat from '../locales/ar/chat.json';
import arSettings from '../locales/ar/settings.json';

const namespaces = ['common', 'home', 'auth', 'pals', 'chat', 'settings'] as const;

function applyDocumentMeta(language: string) {
  const dir = i18n.t('dir', { lng: language, ns: 'common' });
  document.documentElement.lang = language;
  document.documentElement.dir = dir === 'rtl' ? 'rtl' : 'ltr';
}

void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        common: enCommon,
        home: enHome,
        auth: enAuth,
        pals: enPals,
        chat: enChat,
        settings: enSettings,
      },
      ar: {
        common: arCommon,
        home: arHome,
        auth: arAuth,
        pals: arPals,
        chat: arChat,
        settings: arSettings,
      },
    },
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
