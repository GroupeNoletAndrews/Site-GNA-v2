import fr from './fr';
import en from './en';

export const translations = {
  fr,
  en,
};

export type Locale = 'fr' | 'en';

export const defaultLocale: Locale = 'fr';

export default translations;
