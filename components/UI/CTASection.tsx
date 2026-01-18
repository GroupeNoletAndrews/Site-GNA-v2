import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useI18n } from '../../contexts/I18nContext';

const CTASection: React.FC = () => {
  const { t } = useI18n();
  
  return (
    <section className="w-full py-16 flex flex-col items-center text-center relative overflow-hidden">
      {/* Decorative background element */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-gradient-to-r from-blue-100 to-indigo-100 blur-3xl opacity-50 -z-10 rounded-full" />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="max-w-3xl px-6"
      >
        <h2 className="text-3xl md:text-5xl font-normal text-slate-900 mb-6 tracking-tight">
          {t('landing.cta.heading')}
        </h2>
        <p className="text-lg text-slate-600 mb-8 max-w-xl mx-auto font-light">
          {t('landing.cta.description')}
        </p>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="group relative inline-flex items-center gap-3 px-8 py-4 bg-slate-900 text-white rounded-full font-normal text-lg overflow-hidden shadow-lg shadow-slate-900/20"
        >
          <span className="relative z-10">{t('landing.cta.button')}</span>
          <ArrowRight className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform" />
          
          {/* Button Shine Effect */}
          <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent z-0" />
        </motion.button>
      </motion.div>
    </section>
  );
};

export default CTASection;