import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { InitOptions } from 'i18next';
import en from './locales/en';
import hi from './locales/hi';
import te from './locales/te';

const i18nConfig: InitOptions = {
  resources: {
    en: { translation: en },
    hi: { translation: hi },
    te: { translation: te },
  },
  lng: 'en', // default language
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
  compatibilityJSON: 'v4', // To make it work with Android/iOS
};

i18n
  .use(initReactI18next)
  .init(i18nConfig)
  .catch((err) => console.error('i18n initialization failed:', err));

export default i18n;
