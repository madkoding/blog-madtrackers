import { en } from './en';
import { es } from './es';

export const translations = {
  en,
  es,
} as const;

export type TranslationKey = keyof typeof en;
export type Language = keyof typeof translations;
