import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Locale, defaultLocale, translations } from '../i18n';

interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, tile?: string) => string | any;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

interface I18nProviderProps {
  children: ReactNode;
}

export const I18nProvider: React.FC<I18nProviderProps> = ({ children }) => {
  const [locale, setLocaleState] = useState<Locale>(defaultLocale);

  // Charger la langue depuis le cookie au montage
  useEffect(() => {
    const getCookie = (name: string): string | null => {
      if (typeof document === 'undefined') return null;
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
      return null;
    };

    const savedLocale = getCookie('locale') as Locale | null;
    if (savedLocale && (savedLocale === 'fr' || savedLocale === 'en')) {
      setLocaleState(savedLocale);
    }
  }, []);

  // Fonction pour définir la langue avec cookie
  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    
    // Sauvegarder dans le cookie
    if (typeof document !== 'undefined') {
      const date = new Date();
      date.setTime(date.getTime() + 365 * 24 * 60 * 60 * 1000);
      const expires = `expires=${date.toUTCString()}`;
      document.cookie = `locale=${newLocale};${expires};path=/;SameSite=Lax`;
    }
  };

  // Fonction de traduction : t('key', 'tile') ou t('tile.key')
  const t = (key: string, tile?: string): string | any => {
    const localeTranslations = translations[locale];
    
    // Support pour 'tile.key' format
    if (key.includes('.')) {
      const parts = key.split('.');
      let value: any = localeTranslations;
      
      for (const part of parts) {
        if (value && typeof value === 'object' && part in value) {
          value = value[part];
        } else {
          return key; // Retourne la clé si pas trouvée
        }
      }
      return value || key;
    }
    
    // Support pour t('key', 'tile') format
    if (tile && localeTranslations[tile]) {
      const tileTranslations = localeTranslations[tile];
      const keys = key.split('.');
      let value: any = tileTranslations;
      
      for (const k of keys) {
        if (value && typeof value === 'object' && k in value) {
          value = value[k];
        } else {
          return key;
        }
      }
      return value || key;
    }
    
    // Fallback: chercher directement dans common
    if (localeTranslations.common && localeTranslations.common[key]) {
      return localeTranslations.common[key];
    }
    
    return key;
  };

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  );
};

export const useI18n = () => {
  const context = useContext(I18nContext);
  if (context === undefined) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
};
