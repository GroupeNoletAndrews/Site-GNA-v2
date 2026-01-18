import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Languages } from 'lucide-react';
import { useI18n } from '../../contexts/I18nContext';

const LanguageSwitcher: React.FC = () => {
  const { locale, setLocale } = useI18n();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const toggleLanguage = () => {
    const newLocale = locale === 'fr' ? 'en' : 'fr';
    setLocale(newLocale);
  };

  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-[100] pointer-events-auto"
    >
      <motion.button
        onClick={toggleLanguage}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="group relative flex items-center gap-2.5 md:gap-3 px-4 py-2.5 md:px-5 md:py-3 rounded-full bg-white/95 hover:bg-white border border-slate-200/80 hover:border-slate-300 shadow-lg hover:shadow-xl transition-all duration-300 ease-out"
        aria-label={`Switch to ${locale === 'fr' ? 'English' : 'Français'}`}
      >
        {/* Icône avec animation subtile */}
        <motion.div
          animate={{ rotate: locale === 'fr' ? 0 : 360 }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
        >
          <Languages className="w-4 h-4 md:w-5 md:h-5 text-slate-700 group-hover:text-slate-900 transition-colors shrink-0" />
        </motion.div>
        
        {/* Labels avec animation fluide */}
        <div className="relative flex items-center gap-2 overflow-hidden h-5 md:h-6">
          <AnimatePresence mode="wait">
            <motion.span
              key={locale}
              initial={{ opacity: 0, y: 10, rotateX: -90 }}
              animate={{ opacity: 1, y: 0, rotateX: 0 }}
              exit={{ opacity: 0, y: -10, rotateX: 90 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="text-xs md:text-sm font-semibold uppercase tracking-wide text-slate-700 group-hover:text-slate-900 whitespace-nowrap"
            >
              {locale === 'fr' ? 'FR' : 'EN'}
            </motion.span>
          </AnimatePresence>

          {/* Switch élégant et moderne */}
          <div className="relative w-9 h-5 md:w-11 md:h-6 rounded-full bg-slate-100 group-hover:bg-slate-200 transition-colors duration-300">
            <motion.div
              className="absolute top-0.5 left-0.5 md:top-0.5 md:left-0.5 w-4 h-4 md:w-5 md:h-5 rounded-full bg-white shadow-md flex items-center justify-center"
              animate={{
                x: locale === 'fr' ? 0 : 16,
              }}
              transition={{
                type: 'spring',
                stiffness: 400,
                damping: 25,
              }}
            >
              {/* Petite indication à l'intérieur du toggle */}
              <motion.div
                className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-slate-400"
                animate={{
                  scale: locale === 'fr' ? 1 : 0.8,
                  opacity: locale === 'fr' ? 1 : 0.6,
                }}
                transition={{ duration: 0.2 }}
              />
            </motion.div>
          </div>
        </div>

        {/* Effet de brillance au hover */}
        <motion.div
          className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 pointer-events-none"
          initial={false}
          animate={{
            background: [
              'radial-gradient(circle at 50% 50%, transparent 0%, rgba(148, 163, 184, 0.1) 100%)',
              'radial-gradient(circle at 50% 50%, transparent 30%, rgba(148, 163, 184, 0.15) 100%)',
              'radial-gradient(circle at 50% 50%, transparent 0%, rgba(148, 163, 184, 0.1) 100%)',
            ],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </motion.button>

      {/* Tooltip élégant et discret */}
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 5 }}
          transition={{ duration: 0.2 }}
          className="hidden md:block absolute bottom-full right-0 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"
        >
          <div className="bg-slate-900 text-white text-[11px] px-3 py-1.5 rounded-lg shadow-xl whitespace-nowrap backdrop-blur-sm">
            {locale === 'fr' ? 'Switch to English' : 'Passer en français'}
            <div className="absolute top-full right-4 mt-0.5 border-4 border-transparent border-t-slate-900" />
          </div>
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
};

export default LanguageSwitcher;