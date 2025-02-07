import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import en from '@/app/translations/en';
import hi from '@/app/translations/hi';
import te from '@/app/translations/te';

type Language = 'en' | 'hi' | 'te';

interface LanguageState {
  language: Language;
  translations: typeof en;
  setLanguage: (lang: Language) => void;
}

export const useLanguageStore = create<LanguageState>((set) => ({
  language: 'en',
  translations: en,
  setLanguage: (lang) => {
    const translations = {
      en,
      hi,
      te,
    }[lang];
    set({ language: lang, translations });
  },
}));
