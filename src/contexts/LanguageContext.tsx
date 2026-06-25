import React, { createContext, useContext, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../services/firebase';
import '../i18n';

interface LanguageContextType {
  language: string;
  setLanguage: (lang: string) => void;
  t: any;
  dir: 'ltr' | 'rtl';
  i18n: any;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Helper function to convert flat keys ("nav.home") back to nested objects
const unflatten = (data: Record<string, any>) => {
  const result: any = {};
  for (const i in data) {
    const keys = i.split('.');
    keys.reduce((r, a, j) => {
      return r[a] || (r[a] = keys.length - 1 === j ? data[i] : {});
    }, result);
  }
  return result;
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { t, i18n } = useTranslation();
  const language = i18n.language || 'en';
  const dir = language === 'ur' ? 'rtl' : 'ltr';

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = dir;
  }, [language, dir]);

  // Subscribe to real-time Firestore translation overrides
  useEffect(() => {
    const langs = ['en', 'no', 'ur'];
    const unsubs = langs.map(lng => {
      return onSnapshot(doc(db, 'translations', lng), (docSnap) => {
        if (docSnap.exists()) {
          const overrides = docSnap.data();
          const nested = unflatten(overrides);
          i18n.addResourceBundle(lng, 'translation', nested, true, true);
          // Force a state update if the updated overrides are for the current language
          if (i18n.language === lng) {
            i18n.changeLanguage(lng);
          }
        }
      }, (err) => {
        console.warn(`Failed to listen to overrides for ${lng}:`, err);
      });
    });
    return () => unsubs.forEach(unsub => unsub());
  }, [i18n]);

  const setLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, dir, i18n }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
