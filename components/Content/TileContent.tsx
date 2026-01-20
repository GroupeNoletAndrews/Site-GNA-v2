import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle, ArrowRight, CheckCircle, ChevronDown, Loader2, Mail, Phone, Send } from 'lucide-react';
import React, { ReactNode, useEffect, useRef, useState } from 'react';
import { useI18n } from '../../contexts/I18nContext';
import { GridItem } from '../../types';
interface TileContentProps {
  item: GridItem;
  isMobile?: boolean; // Mobile accordion rendering
  isPortraitFlow?: boolean; // NEW: Vertical Desktop Flow rendering
}

interface StyleConfig {
  isDark: boolean;
  text: string;
  subtext: string;
  card: string;
  cardAlt: string;
  accentBg: string;
  button: string;
}

// --- LOGIQUE DE GESTION DU SCROLL (DESKTOP LANDSCAPE) ---
interface ScrollableContainerProps {
  sections: ReactNode[];
  themeColor: string; // Used for the active dot indicator
}

const ScrollableContainer: React.FC<ScrollableContainerProps> = ({ sections, themeColor }) => {
  const { t } = useI18n();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);
  const touchStartY = useRef<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleScroll = (direction: 'up' | 'down') => {
    if (isScrolling) return;

    setIsScrolling(true);
    if (direction === 'down' && currentIndex < sections.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else if (direction === 'up' && currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }

    setTimeout(() => {
      setIsScrolling(false);
    }, 800);
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault(); 
      if (Math.abs(e.deltaY) > 20) {
        handleScroll(e.deltaY > 0 ? 'down' : 'up');
      }
    };

    container.addEventListener('wheel', onWheel, { passive: false });
    return () => container.removeEventListener('wheel', onWheel);
  }, [currentIndex, isScrolling, sections.length]);

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    const touchEndY = e.changedTouches[0].clientY;
    const diff = touchStartY.current - touchEndY;

    if (Math.abs(diff) > 50) {
      handleScroll(diff > 0 ? 'down' : 'up');
    }
  };

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown' || e.key === 'PageDown') {
        handleScroll('down');
      } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
        handleScroll('up');
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [currentIndex, isScrolling]);


  return (
    <div 
      ref={containerRef}
      className="w-full h-full relative overflow-hidden outline-none"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      tabIndex={0}
    >
      <motion.div
        className="w-full h-full will-change-transform"
        animate={{ y: `-${currentIndex * 100}%` }}
        transition={{ type: "spring", stiffness: 50, damping: 15, mass: 1 }}
      >
        {sections.map((section, idx) => (
          <div key={idx} className="w-full h-full flex flex-col p-8 md:px-12 md:py-10 xl:px-20 xl:py-16 2xl:px-24 2xl:py-20 overflow-hidden relative justify-center">
             {section}
          </div>
        ))}
      </motion.div>

      <div className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 flex flex-col gap-4 z-50">
        {sections.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            className="group relative flex items-center justify-center w-6 h-6"
            aria-label={`${t('common.alleraSection')} ${idx + 1}`}
          >
            <div className={`absolute right-full mr-2 px-2 py-1 backdrop-blur-md rounded text-[10px] opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none font-light shadow-sm ${themeColor === 'white' ? 'bg-white/20 text-white' : 'bg-black/10 text-slate-900'}`}>
               {t('common.section')} {idx + 1}
            </div>
            <div className={`w-2 h-2 rounded-full transition-all duration-300 ${idx === currentIndex ? 'scale-0 opacity-0' : 'bg-current opacity-30 hover:opacity-80 hover:scale-125'}`} />
            {idx === currentIndex && (
              <motion.div
                layoutId="active-dot"
                className={`absolute w-3 h-3 rounded-full border-2 border-current bg-transparent opacity-100`}
                transition={{ duration: 0.3 }}
              >
                  <div className="w-full h-full bg-current rounded-full opacity-100" />
              </motion.div>
            )}
          </button>
        ))}
      </div>
      
      <AnimatePresence>
        {currentIndex === 0 && sections.length > 1 && (
            <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }}
                className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-60 pointer-events-none"
            >
                <span className="text-xs uppercase tracking-widest font-normal">{t('common.scroll')}</span>
                <motion.div
                    animate={{ y: [0, 5, 0] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                >
                    <ChevronDown className="w-5 h-5" />
                </motion.div>
            </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};


// --- CONTENU SPÉCIFIQUE (DÉCOUPÉ EN SECTIONS & ADAPTATIF) ---

const DevSolutionsSections = (s: StyleConfig, t: (key: string) => any) => [
  // SECTION 1: INTRO
  <div className="h-full flex flex-col justify-center max-w-4xl 2xl:max-w-6xl">
    <h3 className={`text-2xl md:text-3xl lg:text-5xl xl:text-6xl 2xl:text-7xl font-normal mb-4 md:mb-6 2xl:mb-10 ${s.text}`}>{t('dev-solutions.intro.heading')}</h3>
    <p className={`text-base md:text-xl lg:text-2xl 2xl:text-3xl leading-relaxed font-light ${s.subtext}`}>
      {t('dev-solutions.intro.description')}
    </p>
    <div className="mt-8 md:mt-12 flex gap-4">
        {(t('dev-solutions.intro.tags') as string[] || []).map((tag, i) => (
          <div key={i} className={`px-4 py-2 md:px-6 md:py-3 rounded-lg font-normal text-sm md:text-base xl:text-lg 2xl:text-xl ${s.card}`}>{tag}</div>
        ))}
    </div>
  </div>,

  // SECTION 2: POINTS CLÉS
  <div className="h-full flex flex-col justify-center max-w-4xl 2xl:max-w-6xl">
    <h3 className={`text-xl md:text-2xl lg:text-4xl xl:text-5xl 2xl:text-6xl font-normal mb-6 md:mb-10 ${s.text}`}>{t('dev-solutions.section2.heading')}</h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 xl:gap-12">
       <div className="space-y-6 xl:space-y-10">
          <div className="flex items-start gap-4 xl:gap-6">
              <div className={`w-10 h-10 md:w-12 md:h-12 xl:w-16 xl:h-16 rounded-full flex items-center justify-center font-normal shrink-0 ${s.accentBg} text-base xl:text-xl`}>01</div>
              <div>
                  <h4 className={`font-normal text-base md:text-lg xl:text-2xl ${s.text}`}>{t('dev-solutions.section2.point1.title')}</h4>
                  <p className={`font-light text-sm md:text-base xl:text-lg ${s.subtext}`}>{t('dev-solutions.section2.point1.description')}</p>
              </div>
          </div>
          <div className="flex items-start gap-4 xl:gap-6">
              <div className={`w-10 h-10 md:w-12 md:h-12 xl:w-16 xl:h-16 rounded-full flex items-center justify-center font-normal shrink-0 ${s.accentBg} text-base xl:text-xl`}>02</div>
              <div>
                  <h4 className={`font-normal text-base md:text-lg xl:text-2xl ${s.text}`}>{t('dev-solutions.section2.point2.title')}</h4>
                  <p className={`font-light text-sm md:text-base xl:text-lg ${s.subtext}`}>{t('dev-solutions.section2.point2.description')}</p>
              </div>
          </div>
       </div>
       <div className={`p-6 xl:p-8 rounded-2xl ${s.card} flex flex-col justify-center`}>
          <h4 className={`font-normal mb-4 text-base md:text-lg xl:text-2xl ${s.text}`}>{t('dev-solutions.section2.card.title')}</h4>
          <p className={`font-light text-sm md:text-base xl:text-lg leading-relaxed ${s.subtext}`}>
              {t('dev-solutions.section2.card.description')}
          </p>
       </div>
    </div>
  </div>,

  // SECTION 3: CONCLUSION
  <div className="h-full flex flex-col justify-center items-center text-center max-w-4xl mx-auto">
      <h3 className={`text-xl md:text-2xl lg:text-4xl xl:text-5xl font-normal mb-8 md:mb-12 ${s.text}`}>{t('dev-solutions.section3.heading')}</h3>
      <div className={`p-8 md:p-12 rounded-3xl ${s.cardAlt} relative overflow-hidden`}>
         <span className="absolute top-4 left-6 text-6xl md:text-8xl opacity-10 font-serif">"</span>
         <p className={`text-lg md:text-2xl xl:text-3xl font-light leading-relaxed relative z-10 ${s.text}`}>
           {t('dev-solutions.section3.quote')}
         </p>
      </div>
  </div>
];

const OptimisationSections = (s: StyleConfig, t: (key: string) => any) => [
  // SECTION 1: INTRO
  <div className="h-full flex flex-col justify-center max-w-4xl 2xl:max-w-6xl">
    <h3 className={`text-2xl md:text-3xl lg:text-5xl xl:text-6xl 2xl:text-7xl font-normal mb-4 md:mb-6 2xl:mb-10 ${s.text}`}>{t('optimisation.intro.heading')}</h3>
    <p className={`text-base md:text-xl lg:text-2xl 2xl:text-3xl leading-relaxed font-light ${s.subtext}`}>
      {t('optimisation.intro.description')}
    </p>
    <div className="mt-8 md:mt-12 flex gap-4">
        {(t('optimisation.intro.tags') as string[] || []).map((tag, i) => (
          <div key={i} className={`px-4 py-2 md:px-6 md:py-3 rounded-lg font-normal text-sm md:text-base xl:text-lg 2xl:text-xl ${s.card}`}>{tag}</div>
        ))}
    </div>
  </div>,

  // SECTION 2: POINTS CLÉS
  <div className="h-full flex flex-col justify-center max-w-5xl 2xl:max-w-7xl">
    <h3 className={`text-xl md:text-2xl lg:text-4xl xl:text-5xl 2xl:text-6xl font-normal mb-6 md:mb-10 ${s.text}`}>{t('optimisation.section2.heading')}</h3>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-6 xl:gap-8">
       {/* Point 1 */}
       <div className={`p-6 xl:p-8 rounded-2xl ${s.card} flex flex-col`}>
          <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center font-normal mb-4 shrink-0 ${s.accentBg} text-base`}>01</div>
          <h4 className={`font-normal text-lg xl:text-2xl mb-3 ${s.text}`}>{t('optimisation.section2.point1.title')}</h4>
          <p className={`font-light text-sm md:text-base leading-relaxed ${s.subtext}`}>
            {t('optimisation.section2.point1.description')}
          </p>
       </div>
       {/* Point 2 */}
       <div className={`p-6 xl:p-8 rounded-2xl ${s.card} flex flex-col`}>
          <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center font-normal mb-4 shrink-0 ${s.accentBg} text-base`}>02</div>
          <h4 className={`font-normal text-lg xl:text-2xl mb-3 ${s.text}`}>{t('optimisation.section2.point2.title')}</h4>
          <p className={`font-light text-sm md:text-base leading-relaxed ${s.subtext}`}>
            {t('optimisation.section2.point2.description')}
          </p>
       </div>
       {/* Point 3 */}
       <div className={`p-6 xl:p-8 rounded-2xl ${s.card} flex flex-col`}>
          <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center font-normal mb-4 shrink-0 ${s.accentBg} text-base`}>03</div>
          <h4 className={`font-normal text-lg xl:text-2xl mb-3 ${s.text}`}>{t('optimisation.section2.point3.title')}</h4>
          <p className={`font-light text-sm md:text-base leading-relaxed ${s.subtext}`}>
            {t('optimisation.section2.point3.description')}
          </p>
       </div>
    </div>
  </div>,

  // SECTION 3: CONCLUSION
  <div className="h-full flex flex-col justify-center items-center text-center max-w-4xl mx-auto">
      <h3 className={`text-xl md:text-2xl lg:text-4xl xl:text-5xl font-normal mb-8 md:mb-12 ${s.text}`}>{t('optimisation.section3.heading')}</h3>
      <div className={`p-8 md:p-12 rounded-3xl ${s.cardAlt} relative overflow-hidden`}>
         <span className="absolute top-4 left-6 text-6xl md:text-8xl opacity-10 font-serif">"</span>
         <p className={`text-lg md:text-2xl xl:text-3xl font-light leading-relaxed relative z-10 ${s.text}`}>
           {t('optimisation.section3.quote')}
         </p>
      </div>
  </div>
];

const AutomatisationSections = (s: StyleConfig, t: (key: string) => any) => [
  // SECTION 1: INTRO
  <div className="h-full flex flex-col justify-center max-w-4xl 2xl:max-w-6xl">
    <h3 className={`text-2xl md:text-3xl lg:text-5xl xl:text-6xl 2xl:text-7xl font-normal mb-4 md:mb-6 2xl:mb-10 ${s.text}`}>{t('automatisation.intro.heading')}</h3>
    <p className={`text-base md:text-xl lg:text-2xl 2xl:text-3xl leading-relaxed font-light ${s.subtext}`}>
      {t('automatisation.intro.description')}
    </p>
    <div className="mt-8 md:mt-12 flex gap-4">
        {(t('automatisation.intro.tags') as string[] || []).map((tag, i) => (
          <div key={i} className={`px-4 py-2 md:px-6 md:py-3 rounded-lg font-normal text-sm md:text-base xl:text-lg 2xl:text-xl ${s.card}`}>{tag}</div>
        ))}
    </div>
  </div>,

  // SECTION 2: POINTS CLÉS
  <div className="h-full flex flex-col justify-center max-w-5xl 2xl:max-w-7xl">
    <h3 className={`text-xl md:text-2xl lg:text-4xl xl:text-5xl 2xl:text-6xl font-normal mb-6 md:mb-10 ${s.text}`}>{t('automatisation.section2.heading')}</h3>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-6 xl:gap-8">
       {/* Point 1 */}
       <div className={`p-6 xl:p-8 rounded-2xl ${s.card} flex flex-col`}>
          <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center font-normal mb-4 shrink-0 ${s.accentBg} text-base`}>01</div>
          <h4 className={`font-normal text-lg xl:text-2xl mb-3 ${s.text}`}>{t('automatisation.section2.point1.title')}</h4>
          <p className={`font-light text-sm md:text-base leading-relaxed ${s.subtext}`}>
            {t('automatisation.section2.point1.description')}
          </p>
       </div>
       {/* Point 2 */}
       <div className={`p-6 xl:p-8 rounded-2xl ${s.card} flex flex-col`}>
          <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center font-normal mb-4 shrink-0 ${s.accentBg} text-base`}>02</div>
          <h4 className={`font-normal text-lg xl:text-2xl mb-3 ${s.text}`}>{t('automatisation.section2.point2.title')}</h4>
          <p className={`font-light text-sm md:text-base leading-relaxed ${s.subtext}`}>
            {t('automatisation.section2.point2.description')}
          </p>
       </div>
       {/* Point 3 */}
       <div className={`p-6 xl:p-8 rounded-2xl ${s.card} flex flex-col`}>
          <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center font-normal mb-4 shrink-0 ${s.accentBg} text-base`}>03</div>
          <h4 className={`font-normal text-lg xl:text-2xl mb-3 ${s.text}`}>{t('automatisation.section2.point3.title')}</h4>
          <p className={`font-light text-sm md:text-base leading-relaxed ${s.subtext}`}>
            {t('automatisation.section2.point3.description')}
          </p>
       </div>
    </div>
  </div>,

  // SECTION 3: CONCLUSION
  <div className="h-full flex flex-col justify-center items-center text-center max-w-4xl mx-auto">
      <h3 className={`text-xl md:text-2xl lg:text-4xl xl:text-5xl font-normal mb-8 md:mb-12 ${s.text}`}>{t('automatisation.section3.heading')}</h3>
      <div className={`p-8 md:p-12 rounded-3xl ${s.cardAlt} relative overflow-hidden`}>
         <span className="absolute top-4 left-6 text-6xl md:text-8xl opacity-10 font-serif">"</span>
         <p className={`text-lg md:text-2xl xl:text-3xl font-light leading-relaxed relative z-10 ${s.text}`}>
           {t('automatisation.section3.quote')}
         </p>
      </div>
  </div>
];

const ConseilSections = (s: StyleConfig, t: (key: string) => any) => [
  // SECTION 1: INTRO
  <div className="h-full flex flex-col justify-center max-w-4xl 2xl:max-w-6xl">
    <h3 className={`text-2xl md:text-3xl lg:text-5xl xl:text-6xl 2xl:text-7xl font-normal mb-4 md:mb-6 2xl:mb-10 ${s.text}`}>{t('conseil.intro.heading')}</h3>
    <p className={`text-base md:text-xl lg:text-2xl 2xl:text-3xl leading-relaxed font-light ${s.subtext}`}>
      {t('conseil.intro.description')}
    </p>
    <div className="mt-8 md:mt-12 flex gap-4">
        {(t('conseil.intro.tags') as string[] || []).map((tag, i) => (
          <div key={i} className={`px-4 py-2 md:px-6 md:py-3 rounded-lg font-normal text-sm md:text-base xl:text-lg 2xl:text-xl ${s.card}`}>{tag}</div>
        ))}
    </div>
  </div>,

  // SECTION 2: POINTS CLÉS
  <div className="h-full flex flex-col justify-center max-w-5xl 2xl:max-w-7xl">
    <h3 className={`text-xl md:text-2xl lg:text-4xl xl:text-5xl 2xl:text-6xl font-normal mb-6 md:mb-10 ${s.text}`}>{t('conseil.section2.heading')}</h3>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-6 xl:gap-8">
       {/* Point 1 */}
       <div className={`p-6 xl:p-8 rounded-2xl ${s.card} flex flex-col`}>
          <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center font-normal mb-4 shrink-0 ${s.accentBg} text-base`}>01</div>
          <h4 className={`font-normal text-lg xl:text-2xl mb-3 ${s.text}`}>{t('conseil.section2.point1.title')}</h4>
          <p className={`font-light text-sm md:text-base leading-relaxed ${s.subtext}`}>
            {t('conseil.section2.point1.description')}
          </p>
       </div>
       {/* Point 2 */}
       <div className={`p-6 xl:p-8 rounded-2xl ${s.card} flex flex-col`}>
          <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center font-normal mb-4 shrink-0 ${s.accentBg} text-base`}>02</div>
          <h4 className={`font-normal text-lg xl:text-2xl mb-3 ${s.text}`}>{t('conseil.section2.point2.title')}</h4>
          <p className={`font-light text-sm md:text-base leading-relaxed ${s.subtext}`}>
            {t('conseil.section2.point2.description')}
          </p>
       </div>
       {/* Point 3 */}
       <div className={`p-6 xl:p-8 rounded-2xl ${s.card} flex flex-col`}>
          <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center font-normal mb-4 shrink-0 ${s.accentBg} text-base`}>03</div>
          <h4 className={`font-normal text-lg xl:text-2xl mb-3 ${s.text}`}>{t('conseil.section2.point3.title')}</h4>
          <p className={`font-light text-sm md:text-base leading-relaxed ${s.subtext}`}>
            {t('conseil.section2.point3.description')}
          </p>
       </div>
    </div>
  </div>,

  // SECTION 3: CONCLUSION
  <div className="h-full flex flex-col justify-center items-center text-center max-w-4xl mx-auto">
      <h3 className={`text-xl md:text-2xl lg:text-4xl xl:text-5xl font-normal mb-8 md:mb-12 ${s.text}`}>{t('conseil.section3.heading')}</h3>
      <div className={`p-8 md:p-12 rounded-3xl ${s.cardAlt} relative overflow-hidden`}>
         <span className="absolute top-4 left-6 text-6xl md:text-8xl opacity-10 font-serif">"</span>
         <p className={`text-lg md:text-2xl xl:text-3xl font-light leading-relaxed relative z-10 ${s.text}`}>
           {t('conseil.section3.quote')}
         </p>
      </div>
  </div>
];

const DataAnalysisSections = (s: StyleConfig, t: (key: string) => any) => [
  // SECTION 1: INTRO
  <div className="h-full flex flex-col justify-center max-w-4xl 2xl:max-w-6xl">
    <h3 className={`text-2xl md:text-3xl lg:text-5xl xl:text-6xl 2xl:text-7xl font-normal mb-4 md:mb-6 2xl:mb-10 ${s.text}`}>{t('data-analysis.intro.heading')}</h3>
    <p className={`text-base md:text-xl lg:text-2xl 2xl:text-3xl leading-relaxed font-light ${s.subtext}`}>
      {t('data-analysis.intro.description')}
    </p>
    <div className="mt-8 md:mt-12 flex gap-4">
        {(t('data-analysis.intro.tags') as string[] || []).map((tag, i) => (
          <div key={i} className={`px-4 py-2 md:px-6 md:py-3 rounded-lg font-normal text-sm md:text-base xl:text-lg 2xl:text-xl ${s.card}`}>{tag}</div>
        ))}
    </div>
  </div>,

  // SECTION 2: POINTS CLÉS
  <div className="h-full flex flex-col justify-center max-w-5xl 2xl:max-w-7xl">
    <h3 className={`text-xl md:text-2xl lg:text-4xl xl:text-5xl 2xl:text-6xl font-normal mb-6 md:mb-10 ${s.text}`}>{t('data-analysis.section2.heading')}</h3>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-6 xl:gap-8">
       {/* Point 1 */}
       <div className={`p-6 xl:p-8 rounded-2xl ${s.card} flex flex-col`}>
          <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center font-normal mb-4 shrink-0 ${s.accentBg} text-base`}>01</div>
          <h4 className={`font-normal text-lg xl:text-2xl mb-3 ${s.text}`}>{t('data-analysis.section2.point1.title')}</h4>
          <p className={`font-light text-sm md:text-base leading-relaxed ${s.subtext}`}>
            {t('data-analysis.section2.point1.description')}
          </p>
       </div>
       {/* Point 2 */}
       <div className={`p-6 xl:p-8 rounded-2xl ${s.card} flex flex-col`}>
          <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center font-normal mb-4 shrink-0 ${s.accentBg} text-base`}>02</div>
          <h4 className={`font-normal text-lg xl:text-2xl mb-3 ${s.text}`}>{t('data-analysis.section2.point2.title')}</h4>
          <p className={`font-light text-sm md:text-base leading-relaxed ${s.subtext}`}>
            {t('data-analysis.section2.point2.description')}
          </p>
       </div>
       {/* Point 3 */}
       <div className={`p-6 xl:p-8 rounded-2xl ${s.card} flex flex-col`}>
          <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center font-normal mb-4 shrink-0 ${s.accentBg} text-base`}>03</div>
          <h4 className={`font-normal text-lg xl:text-2xl mb-3 ${s.text}`}>{t('data-analysis.section2.point3.title')}</h4>
          <p className={`font-light text-sm md:text-base leading-relaxed ${s.subtext}`}>
            {t('data-analysis.section2.point3.description')}
          </p>
       </div>
    </div>
  </div>,

  // SECTION 3: CONCLUSION
  <div className="h-full flex flex-col justify-center items-center text-center max-w-4xl mx-auto">
      <h3 className={`text-xl md:text-2xl lg:text-4xl xl:text-5xl font-normal mb-8 md:mb-12 ${s.text}`}>{t('data-analysis.section3.heading')}</h3>
      <div className={`p-8 md:p-12 rounded-3xl ${s.cardAlt} relative overflow-hidden`}>
         <span className="absolute top-4 left-6 text-6xl md:text-8xl opacity-10 font-serif">"</span>
         <p className={`text-lg md:text-2xl xl:text-3xl font-light leading-relaxed relative z-10 ${s.text}`}>
           {t('data-analysis.section3.quote')}
         </p>
      </div>
  </div>
];

const FormationSections = (s: StyleConfig, t: (key: string) => any) => [
  // SECTION 1: INTRO
  <div className="h-full flex flex-col justify-center max-w-4xl 2xl:max-w-6xl">
    <h3 className={`text-2xl md:text-3xl lg:text-5xl xl:text-6xl 2xl:text-7xl font-normal mb-4 md:mb-6 2xl:mb-10 ${s.text}`}>{t('formation.intro.heading')}</h3>
    <p className={`text-base md:text-xl lg:text-2xl 2xl:text-3xl leading-relaxed font-light ${s.subtext}`}>
      {t('formation.intro.description')}
    </p>
    <div className="mt-8 md:mt-12 flex gap-4">
        {(t('formation.intro.tags') as string[] || []).map((tag, i) => (
          <div key={i} className={`px-4 py-2 md:px-6 md:py-3 rounded-lg font-normal text-sm md:text-base xl:text-lg 2xl:text-xl ${s.card}`}>{tag}</div>
        ))}
    </div>
  </div>,

  // SECTION 2: POINTS CLÉS
  <div className="h-full flex flex-col justify-center max-w-5xl 2xl:max-w-7xl">
    <h3 className={`text-xl md:text-2xl lg:text-4xl xl:text-5xl 2xl:text-6xl font-normal mb-6 md:mb-10 ${s.text}`}>{t('formation.section2.heading')}</h3>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-6 xl:gap-8">
       {/* Point 1 */}
       <div className={`p-6 xl:p-8 rounded-2xl ${s.card} flex flex-col`}>
          <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center font-normal mb-4 shrink-0 ${s.accentBg} text-base`}>01</div>
          <h4 className={`font-normal text-lg xl:text-2xl mb-3 ${s.text}`}>{t('formation.section2.point1.title')}</h4>
          <p className={`font-light text-sm md:text-base leading-relaxed ${s.subtext}`}>
            {t('formation.section2.point1.description')}
          </p>
       </div>
       {/* Point 2 */}
       <div className={`p-6 xl:p-8 rounded-2xl ${s.card} flex flex-col`}>
          <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center font-normal mb-4 shrink-0 ${s.accentBg} text-base`}>02</div>
          <h4 className={`font-normal text-lg xl:text-2xl mb-3 ${s.text}`}>{t('formation.section2.point2.title')}</h4>
          <p className={`font-light text-sm md:text-base leading-relaxed ${s.subtext}`}>
            {t('formation.section2.point2.description')}
          </p>
       </div>
       {/* Point 3 */}
       <div className={`p-6 xl:p-8 rounded-2xl ${s.card} flex flex-col`}>
          <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center font-normal mb-4 shrink-0 ${s.accentBg} text-base`}>03</div>
          <h4 className={`font-normal text-lg xl:text-2xl mb-3 ${s.text}`}>{t('formation.section2.point3.title')}</h4>
          <p className={`font-light text-sm md:text-base leading-relaxed ${s.subtext}`}>
            {t('formation.section2.point3.description')}
          </p>
       </div>
    </div>
  </div>,

  // SECTION 3: CONCLUSION
  <div className="h-full flex flex-col justify-center items-center text-center max-w-4xl mx-auto">
      <h3 className={`text-xl md:text-2xl lg:text-4xl xl:text-5xl font-normal mb-8 md:mb-12 ${s.text}`}>{t('formation.section3.heading')}</h3>
      <div className={`p-8 md:p-12 rounded-3xl ${s.cardAlt} relative overflow-hidden`}>
         <span className="absolute top-4 left-6 text-6xl md:text-8xl opacity-10 font-serif">"</span>
         <p className={`text-lg md:text-2xl xl:text-3xl font-light leading-relaxed relative z-10 ${s.text}`}>
           {t('formation.section3.quote')}
         </p>
      </div>
  </div>
];

const MaintenanceSections = (s: StyleConfig, t: (key: string) => any) => [
  // SECTION 1: INTRO
  <div className="h-full flex flex-col justify-center max-w-4xl 2xl:max-w-6xl">
    <h3 className={`text-2xl md:text-3xl lg:text-5xl xl:text-6xl 2xl:text-7xl font-normal mb-4 md:mb-6 2xl:mb-10 ${s.text}`}>{t('maintenance.intro.heading')}</h3>
    <p className={`text-base md:text-xl lg:text-2xl 2xl:text-3xl leading-relaxed font-light ${s.subtext}`}>
      {t('maintenance.intro.description')}
    </p>
    <div className="mt-8 md:mt-12 flex gap-4">
        {(t('maintenance.intro.tags') as string[] || []).map((tag, i) => (
          <div key={i} className={`px-4 py-2 md:px-6 md:py-3 rounded-lg font-normal text-sm md:text-base xl:text-lg 2xl:text-xl ${s.card}`}>{tag}</div>
        ))}
    </div>
  </div>,

  // SECTION 2: POINTS CLÉS
  <div className="h-full flex flex-col justify-center max-w-4xl 2xl:max-w-6xl">
    <h3 className={`text-xl md:text-2xl lg:text-4xl xl:text-5xl 2xl:text-6xl font-normal mb-6 md:mb-10 ${s.text}`}>{t('maintenance.section2.heading')}</h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 xl:gap-12">
       <div className="space-y-6 xl:space-y-10">
          <div className="flex items-start gap-4 xl:gap-6">
              <div className={`w-10 h-10 md:w-12 md:h-12 xl:w-16 xl:h-16 rounded-full flex items-center justify-center font-normal shrink-0 ${s.accentBg} text-base xl:text-xl`}>01</div>
              <div>
                  <h4 className={`font-normal text-base md:text-lg xl:text-2xl ${s.text}`}>{t('maintenance.section2.point1.title')}</h4>
                  <p className={`font-light text-sm md:text-base xl:text-lg ${s.subtext}`}>{t('maintenance.section2.point1.description')}</p>
              </div>
          </div>
          <div className="flex items-start gap-4 xl:gap-6">
              <div className={`w-10 h-10 md:w-12 md:h-12 xl:w-16 xl:h-16 rounded-full flex items-center justify-center font-normal shrink-0 ${s.accentBg} text-base xl:text-xl`}>02</div>
              <div>
                  <h4 className={`font-normal text-base md:text-lg xl:text-2xl ${s.text}`}>{t('maintenance.section2.point2.title')}</h4>
                  <p className={`font-light text-sm md:text-base xl:text-lg ${s.subtext}`}>{t('maintenance.section2.point2.description')}</p>
              </div>
          </div>
       </div>
       <div className={`p-6 xl:p-8 rounded-2xl ${s.card} flex flex-col justify-center`}>
          <h4 className={`font-normal mb-4 text-base md:text-lg xl:text-2xl ${s.text}`}>{t('maintenance.section2.card.title')}</h4>
          <p className={`font-light text-sm md:text-base xl:text-lg leading-relaxed ${s.subtext}`}>
              {t('maintenance.section2.card.description')}
          </p>
       </div>
    </div>
  </div>,

  // SECTION 3: CONCLUSION
  <div className="h-full flex flex-col justify-center items-center text-center max-w-4xl mx-auto">
      <h3 className={`text-xl md:text-2xl lg:text-4xl xl:text-5xl font-normal mb-8 md:mb-12 ${s.text}`}>{t('maintenance.section3.heading')}</h3>
      <div className={`p-8 md:p-12 rounded-3xl ${s.cardAlt} relative overflow-hidden`}>
         <span className="absolute top-4 left-6 text-6xl md:text-8xl opacity-10 font-serif">"</span>
         <p className={`text-lg md:text-2xl xl:text-3xl font-light leading-relaxed relative z-10 ${s.text}`}>
           {t('maintenance.section3.quote')}
         </p>
      </div>
  </div>
];

const FinanceSections = (s: StyleConfig, t: (key: string) => any) => [
  // SECTION 1: INTRO
  <div className="h-full flex flex-col justify-center max-w-4xl 2xl:max-w-6xl">
    <h3 className={`text-2xl md:text-3xl lg:text-5xl xl:text-6xl 2xl:text-7xl font-normal mb-4 md:mb-6 2xl:mb-10 ${s.text}`}>{t('finance.intro.heading')}</h3>
    <p className={`text-base md:text-xl lg:text-2xl 2xl:text-3xl leading-relaxed font-light ${s.subtext}`}>
      {t('finance.intro.description')}
    </p>
    <div className="mt-8 md:mt-12 flex gap-4">
        {(t('finance.intro.tags') as string[] || []).map((tag, i) => (
          <div key={i} className={`px-4 py-2 md:px-6 md:py-3 rounded-lg font-normal text-sm md:text-base xl:text-lg 2xl:text-xl ${s.card}`}>{tag}</div>
        ))}
    </div>
  </div>,

  // SECTION 2: POINTS CLÉS
  <div className="h-full flex flex-col justify-center max-w-4xl 2xl:max-w-6xl">
    <h3 className={`text-xl md:text-2xl lg:text-4xl xl:text-5xl 2xl:text-6xl font-normal mb-6 md:mb-10 ${s.text}`}>{t('finance.section2.heading')}</h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 xl:gap-12">
       <div className="space-y-6 xl:space-y-10">
          <div className="flex items-start gap-4 xl:gap-6">
              <div className={`w-10 h-10 md:w-12 md:h-12 xl:w-16 xl:h-16 rounded-full flex items-center justify-center font-normal shrink-0 ${s.accentBg} text-base xl:text-xl`}>01</div>
              <div>
                  <h4 className={`font-normal text-base md:text-lg xl:text-2xl ${s.text}`}>{t('finance.section2.point1.title')}</h4>
                  <p className={`font-light text-sm md:text-base xl:text-lg ${s.subtext}`}>{t('finance.section2.point1.description')}</p>
              </div>
          </div>
          <div className="flex items-start gap-4 xl:gap-6">
              <div className={`w-10 h-10 md:w-12 md:h-12 xl:w-16 xl:h-16 rounded-full flex items-center justify-center font-normal shrink-0 ${s.accentBg} text-base xl:text-xl`}>02</div>
              <div>
                  <h4 className={`font-normal text-base md:text-lg xl:text-2xl ${s.text}`}>{t('finance.section2.point2.title')}</h4>
                  <p className={`font-light text-sm md:text-base xl:text-lg ${s.subtext}`}>{t('finance.section2.point2.description')}</p>
              </div>
          </div>
       </div>
       <div className={`p-6 xl:p-8 rounded-2xl ${s.card} flex flex-col justify-center`}>
          <h4 className={`font-normal mb-4 text-base md:text-lg xl:text-2xl ${s.text}`}>{t('finance.section2.card.title')}</h4>
          <p className={`font-light text-sm md:text-base xl:text-lg leading-relaxed ${s.subtext}`}>
              {t('finance.section2.card.description')}
          </p>
       </div>
    </div>
  </div>,

  // SECTION 3: CONCLUSION
  <div className="h-full flex flex-col justify-center items-center text-center max-w-4xl mx-auto">
      <h3 className={`text-xl md:text-2xl lg:text-4xl xl:text-5xl font-normal mb-8 md:mb-12 ${s.text}`}>{t('finance.section3.heading')}</h3>
      <div className={`p-8 md:p-12 rounded-3xl ${s.cardAlt} relative overflow-hidden`}>
         <span className="absolute top-4 left-6 text-6xl md:text-8xl opacity-10 font-serif">"</span>
         <p className={`text-lg md:text-2xl xl:text-3xl font-light leading-relaxed relative z-10 ${s.text}`}>
           {t('finance.section3.quote')}
         </p>
      </div>
  </div>
];

const WhyUsSections = (s: StyleConfig, t: (key: string) => any) => [
  // SECTION 1: INTRO
  <div className="h-full flex flex-col justify-center max-w-4xl 2xl:max-w-6xl">
    <h3 className={`text-2xl md:text-3xl lg:text-5xl xl:text-6xl 2xl:text-7xl font-normal mb-4 md:mb-6 2xl:mb-10 ${s.text}`}>{t('why-us.intro.heading')}</h3>
    <p className={`text-base md:text-xl lg:text-2xl 2xl:text-3xl leading-relaxed font-light ${s.subtext}`}>
      {t('why-us.intro.question')}
      <br/><br/>
      {t('why-us.intro.description')}
    </p>
    <div className="mt-8 md:mt-12 flex gap-4">
        {(t('why-us.intro.tags') as string[] || []).map((tag, i) => (
          <div key={i} className={`px-4 py-2 md:px-6 md:py-3 rounded-lg font-normal text-sm md:text-base xl:text-lg 2xl:text-xl ${s.card}`}>{tag}</div>
        ))}
    </div>
  </div>,

  // SECTION 2: POINTS CLÉS
  <div className="h-full flex flex-col justify-center max-w-6xl 2xl:max-w-7xl">
    <h3 className={`text-xl md:text-2xl lg:text-4xl xl:text-5xl 2xl:text-6xl font-normal mb-6 md:mb-10 ${s.text}`}>{t('why-us.section2.heading')}</h3>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 xl:gap-8">
       {((t('why-us.section2.points') as any[]) || []).map((p, i) => (
           <div key={i} className={`p-5 xl:p-6 rounded-2xl ${s.card} flex flex-col`}>
              <h4 className={`font-normal text-base md:text-lg xl:text-xl mb-2 ${s.text}`}>{p.title}</h4>
              <p className={`font-light text-xs md:text-sm leading-relaxed ${s.subtext}`}>{p.description}</p>
           </div>
       ))}
    </div>
  </div>,

  // SECTION 3: CONCLUSION
  <div className="h-full flex flex-col justify-center items-center text-center max-w-4xl mx-auto">
      <h3 className={`text-xl md:text-2xl lg:text-4xl xl:text-5xl font-normal mb-8 md:mb-12 ${s.text}`}>{t('why-us.section3.heading')}</h3>
      <div className={`p-8 md:p-12 rounded-3xl ${s.cardAlt} relative overflow-hidden`}>
         <span className="absolute top-4 left-6 text-6xl md:text-8xl opacity-10 font-serif">"</span>
         <p className={`text-lg md:text-2xl xl:text-3xl font-light leading-relaxed relative z-10 ${s.text}`}>
           {t('why-us.section3.quote')}
         </p>
      </div>
  </div>
];

const TeamSections = (s: StyleConfig, t: (key: string) => any) => {
    const leadershipData = t('team.leadership.members') as any[] || [];
    const leadership = leadershipData.map((member, idx) => ({
      name: member.name,
      role: member.role,
      img: idx === 0 
        ? "https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=800&auto=format&fit=crop"
        : "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=800&auto=format&fit=crop"
    }));
    
    const expertsData = t('team.experts.members') as any[] || [];
    const experts = expertsData.map((member, idx) => ({
        name: member.name,
        role: member.role,
        img: idx === 0
          ? "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=800&auto=format&fit=crop"
          : idx === 1
          ? "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=800&auto=format&fit=crop"
          : "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=800&auto=format&fit=crop"
    }));

    const portfolio = t('team.portfolio.projects') as any[] || [];

    return [
    <div className="h-full flex flex-col justify-center max-w-4xl 2xl:max-w-6xl">
        <h3 className={`text-2xl md:text-3xl lg:text-5xl xl:text-6xl 2xl:text-7xl font-normal mb-4 md:mb-6 2xl:mb-10 ${s.text}`}>{t('team.intro.heading')}</h3>
        <p className={`text-base md:text-xl lg:text-2xl 2xl:text-3xl leading-relaxed font-light ${s.subtext}`}>
        {t('team.intro.description1')}
        <br/><br/>
        {t('team.intro.description2')}
        </p>
        <div className="mt-8 md:mt-12 flex gap-4">
            {(t('team.intro.tags') as string[] || []).map((tag, i) => (
              <div key={i} className={`px-4 py-2 md:px-6 md:py-3 rounded-lg font-normal text-sm md:text-base xl:text-lg 2xl:text-xl ${s.card}`}>{tag}</div>
            ))}
        </div>
    </div>,

    <div className="h-full flex flex-col justify-center max-w-5xl 2xl:max-w-6xl">
        <h3 className={`text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-normal mb-6 md:mb-8 ${s.text}`}>{t('team.leadership.heading')}</h3>
        <div className="flex flex-col gap-6 md:gap-8">
            {leadership.map((member, idx) => (
                <div key={idx} className={`flex flex-col md:flex-row items-center gap-6 md:gap-8 ${idx % 2 === 1 ? 'md:flex-row-reverse' : ''}`}>
                    <div className="w-44 h-44 md:w-52 md:h-52 xl:w-64 xl:h-64 rounded-2xl overflow-hidden shadow-lg relative group shrink-0">
                        <img src={member.img} alt={member.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 grayscale group-hover:grayscale-0" />
                        <div className={`absolute inset-0 ${s.accentBg} opacity-20 mix-blend-overlay`} />
                    </div>
                    {/* Text closer */}
                    <div className={`flex flex-col ${idx % 2 === 1 ? 'md:items-end md:text-right' : 'md:items-start md:text-left'} text-center md:text-left`}>
                        <h4 className={`text-xl md:text-2xl xl:text-3xl font-normal mb-1 ${s.text}`}>{member.name}</h4>
                        <p className={`text-sm md:text-base xl:text-lg uppercase tracking-widest font-light opacity-70 ${s.text}`}>{member.role}</p>
                        <div className={`h-0.5 w-10 bg-current opacity-40 mt-3 md:mt-4 hidden md:block`} />
                    </div>
                </div>
            ))}
        </div>
    </div>,

    <div className="h-full flex flex-col justify-center max-w-6xl 2xl:max-w-7xl">
        <h3 className={`text-xl md:text-2xl lg:text-4xl xl:text-5xl font-normal mb-8 md:mb-12 ${s.text}`}>{t('team.experts.heading')}</h3>
        <div className="flex flex-col gap-8">
            {experts.map((member, idx) => (
                <div key={idx} className={`flex flex-col md:flex-row items-center gap-6 md:gap-12 ${idx % 2 === 1 ? 'md:flex-row-reverse' : ''}`}>
                    <div className="w-28 h-28 md:w-36 md:h-36 xl:w-44 xl:h-44 rounded-full overflow-hidden shadow-md shrink-0 border-2 border-white/20">
                        <img src={member.img} alt={member.name} className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-500" />
                    </div>
                    <div className={`flex flex-col ${idx % 2 === 1 ? 'md:items-end md:text-right' : 'md:items-start md:text-left'} text-center md:text-left`}>
                        <h4 className={`text-xl md:text-2xl xl:text-3xl font-normal mb-1 ${s.text}`}>{member.name}</h4>
                        <p className={`text-xs md:text-sm xl:text-base font-light opacity-70 uppercase tracking-wide ${s.text}`}>{member.role}</p>
                    </div>
                </div>
            ))}
        </div>
    </div>,

    <div className="h-full flex flex-col justify-center max-w-6xl 2xl:max-w-7xl">
        <h3 className={`text-xl md:text-2xl lg:text-4xl xl:text-5xl font-normal mb-8 md:mb-12 ${s.text}`}>{t('team.portfolio.heading')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 xl:gap-8">
             {portfolio.map((project, idx) => (
             <div key={idx} className={`group relative rounded-2xl overflow-hidden aspect-video ${s.card} cursor-pointer`}>
                 <img src={idx === 0 ? "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2000&auto=format&fit=crop" : "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2000&auto=format&fit=crop"} className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-opacity duration-500 grayscale group-hover:grayscale-0" />
                 <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                 <div className="absolute bottom-0 left-0 w-full p-6 md:p-8 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                     <p className="text-xs uppercase tracking-widest text-white/70 mb-2">{project.category}</p>
                     <h4 className="text-xl md:text-2xl text-white font-normal flex items-center gap-3">
                         {project.title}
                         <ArrowRight className="w-5 h-5 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all duration-300" />
                     </h4>
                 </div>
             </div>
             ))}
        </div>
    </div>
    ];
};


const ContactForm: React.FC<{ styleConfig: StyleConfig; t: (key: string) => any }> = ({ styleConfig: s, t }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (submitStatus !== 'idle') {
      setSubmitStatus('idle');
      setErrorMessage('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone || !formData.message) {
      setSubmitStatus('error');
      setErrorMessage(t('contact.form.required'));
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setSubmitStatus('error');
      setErrorMessage(t('contact.form.error'));
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('idle');
    setErrorMessage('');

    try {
      console.log('Form data:', formData);
      // En développement: le proxy Vite redirige /api/contact vers localhost:3001
      // En production: Vercel route /api/contact vers la serverless function
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      // Vérifier si la réponse est vide ou invalide
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('Réponse non-JSON reçue:', text);
        throw new Error('Réponse serveur invalide');
      }

      const data = await response.json();

      if (response.ok && data.success) {
        setSubmitStatus('success');
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          message: ''
        });
        setTimeout(() => {
          setSubmitStatus('idle');
        }, 5000);
      } else {
        setSubmitStatus('error');
        setErrorMessage(data.error || t('contact.form.error'));
      }
    } catch (error) {
      console.error('Erreur lors de l\'envoi du formulaire:', error);
      setSubmitStatus('error');
      setErrorMessage(t('contact.form.error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="h-full flex flex-col justify-center max-w-4xl mx-auto w-full">
      <h3 className={`text-xl md:text-2xl lg:text-4xl xl:text-5xl font-normal mb-8 md:mb-10 text-center ${s.text}`}>{t('contact.form.heading')}</h3>
      <form onSubmit={handleSubmit} className="w-full grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label htmlFor="firstName" className={`text-xs uppercase tracking-widest opacity-90 ml-1 font-semibold`}>{t('contact.form.fields.firstName')}</label>
          <input
            id="firstName"
            name="firstName"
            type="text"
            value={formData.firstName}
            onChange={handleChange}
            placeholder={t('contact.form.placeholders.firstName')}
            required
            className={`w-full p-4 rounded-xl bg-white/20 border border-white/30 focus:border-white/80 outline-none transition-colors placeholder:text-white/70 text-white`}
            disabled={isSubmitting}
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="lastName" className={`text-xs uppercase tracking-widest opacity-90 ml-1 font-semibold`}>{t('contact.form.fields.lastName')}</label>
          <input
            id="lastName"
            name="lastName"
            type="text"
            value={formData.lastName}
            onChange={handleChange}
            placeholder={t('contact.form.placeholders.lastName')}
            required
            className={`w-full p-4 rounded-xl bg-white/20 border border-white/30 focus:border-white/80 outline-none transition-colors placeholder:text-white/70 text-white`}
            disabled={isSubmitting}
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="phone" className={`text-xs uppercase tracking-widest opacity-90 ml-1 font-semibold`}>{t('contact.form.fields.phone')}</label>
          <input
            id="phone"
            name="phone"
            type="tel"
            value={formData.phone}
            onChange={handleChange}
            placeholder={t('contact.form.placeholders.phone')}
            required
            className={`w-full p-4 rounded-xl bg-white/20 border border-white/30 focus:border-white/80 outline-none transition-colors placeholder:text-white/70 text-white`}
            disabled={isSubmitting}
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="email" className={`text-xs uppercase tracking-widest opacity-90 ml-1 font-semibold`}>{t('contact.form.fields.email')}</label>
          <input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder={t('contact.form.placeholders.email')}
            required
            className={`w-full p-4 rounded-xl bg-white/20 border border-white/30 focus:border-white/80 outline-none transition-colors placeholder:text-white/70 text-white`}
            disabled={isSubmitting}
          />
        </div>
        <div className="space-y-2 md:col-span-2">
          <label htmlFor="message" className={`text-xs uppercase tracking-widest opacity-90 ml-1 font-semibold`}>{t('contact.form.fields.message')}</label>
          <textarea
            id="message"
            name="message"
            rows={4}
            value={formData.message}
            onChange={handleChange}
            placeholder={t('contact.form.placeholders.message')}
            required
            className={`w-full p-4 rounded-xl bg-white/20 border border-white/30 focus:border-white/80 outline-none transition-colors resize-none placeholder:text-white/70 text-white`}
            disabled={isSubmitting}
          />
        </div>
        
        {/* Messages d'état */}
        <AnimatePresence>
          {submitStatus === 'success' && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="md:col-span-2 flex items-center gap-2 text-green-300"
            >
              <CheckCircle className="w-5 h-5" />
              <p className="text-sm">{t('contact.form.success')}</p>
            </motion.div>
          )}
          {submitStatus === 'error' && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="md:col-span-2 flex items-center gap-2 text-red-300"
            >
              <AlertCircle className="w-5 h-5" />
              <p className="text-sm">{errorMessage}</p>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="md:col-span-2 mt-4 flex justify-center">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`px-10 py-4 rounded-full bg-white text-slate-900 font-bold flex items-center gap-2 hover:scale-105 transition-transform shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100`}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{t('contact.form.submitting')}</span>
              </>
            ) : (
              <>
                <span>{t('contact.form.submit')}</span>
                <Send className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

const ContactSections = (s: StyleConfig, t: (key: string) => any) => [
  // SECTION 1: Intro & Coordonnées
  <div className="h-full flex flex-col justify-center max-w-4xl 2xl:max-w-6xl">
      <h3 className={`text-2xl md:text-3xl lg:text-5xl xl:text-6xl 2xl:text-7xl font-normal mb-4 md:mb-6 2xl:mb-10 ${s.text}`}>{t('contact.intro.heading')}</h3>
      <p className={`text-base md:text-xl lg:text-2xl 2xl:text-3xl leading-relaxed font-light mb-8 md:mb-12 ${s.subtext}`}>
        {t('contact.intro.description')}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <a href="mailto:info@noletandrews.ca" className={`p-6 rounded-2xl ${s.card} group transition-all hover:bg-white/20 flex flex-col gap-4`}>
           <div className={`w-12 h-12 rounded-full ${s.accentBg} flex items-center justify-center`}>
              <Mail className="w-6 h-6" />
           </div>
           <div>
              <p className={`text-xs uppercase tracking-widest opacity-70 mb-1`}>{t('contact.form.fields.email')}</p>
              <p className={`text-lg md:text-xl font-medium`}>info@noletandrews.ca</p>
           </div>
        </a>
        <a href="tel:+15819868494" className={`p-6 rounded-2xl ${s.card} group transition-all hover:bg-white/20 flex flex-col gap-4`}>
           <div className={`w-12 h-12 rounded-full ${s.accentBg} flex items-center justify-center`}>
              <Phone className="w-6 h-6" />
           </div>
           <div>
              <p className={`text-xs uppercase tracking-widest opacity-70 mb-1`}>{t('contact.form.fields.phone')}</p>
              <p className={`text-lg md:text-xl font-medium`}>+1 (581) 986-8494</p>
           </div>
        </a>
      </div>
  </div>,

  <ContactForm key="contact-form" styleConfig={s} t={t} />,

 
];

const GenericSections = (item: GridItem, s: StyleConfig, t: (key: string, tile?: string) => any) => [
  <div className="h-full flex flex-col justify-center max-w-3xl 2xl:max-w-5xl">
    <h3 className={`text-2xl md:text-3xl lg:text-5xl xl:text-6xl font-light mb-4 md:mb-6 ${s.text}`}>Introduction</h3>
    <p className={`text-base md:text-xl lg:text-2xl xl:text-3xl font-light leading-relaxed mb-6 md:mb-8 ${s.subtext}`}>
      {item.description}
      <br/><br/>
      Découvrez l'approche unique de Groupe Nolet & Andrews pour <span className="font-normal opacity-100">{item.title}</span>.
    </p>
    <div className={`h-1 w-20 mt-2 md:mt-4 bg-current opacity-80`} />
  </div>,

  <div className="h-full flex flex-col justify-center max-w-4xl 2xl:max-w-6xl">
      <h3 className={`text-xl md:text-2xl lg:text-4xl xl:text-5xl font-normal mb-6 md:mb-10 ${s.text}`}>Points Clés</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 xl:gap-12">
        <div className={`p-6 md:p-8 xl:p-12 rounded-2xl ${s.card}`}>
           <h4 className={`text-lg md:text-xl xl:text-2xl font-normal mb-2 md:mb-4 ${s.text}`}>Expertise</h4>
           <p className={`text-sm md:text-base xl:text-lg font-light ${s.subtext}`}>Une approche basée sur des années d'expérience et une méthodologie éprouvée.</p>
        </div>
        <div className={`p-6 md:p-8 xl:p-12 rounded-2xl ${s.card}`}>
           <h4 className={`text-lg md:text-xl xl:text-2xl font-normal mb-2 md:mb-4 ${s.text}`}>Innovation</h4>
           <p className={`text-sm md:text-base xl:text-lg font-light ${s.subtext}`}>Utilisation des dernières technologies pour garantir un avantage compétitif.</p>
        </div>
      </div>
  </div>,
  
  <div className="h-full flex flex-col justify-center items-center text-center max-w-2xl 2xl:max-w-4xl mx-auto">
      <h3 className={`text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-normal mb-4 md:mb-6 ${s.text}`}>Prêt à avancer ?</h3>
      <p className={`text-base md:text-lg xl:text-xl 2xl:text-2xl mb-6 md:mb-8 font-light ${s.subtext}`}>
          Contactez notre équipe pour discuter de la manière dont {item.title} peut transformer votre entreprise.
      </p>
      <button className={`px-6 py-3 md:px-8 md:py-4 xl:px-10 xl:py-5 rounded-full font-normal shadow-lg text-sm md:text-base xl:text-lg transition-transform hover:scale-105 ${s.button}`}>
          En savoir plus
      </button>
  </div>
];

/**
 * TileContent Manager
 */
const TileContent: React.FC<TileContentProps> = ({ item, isMobile = false, isPortraitFlow = false }) => {
  const { t } = useI18n();
  
  const contentVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1, 
      transition: { delay: 0.3, duration: 0.5 }
    }
  };

  // --- DYNAMIC STYLING SYSTEM ---
  // Detects if the current item has white text (dark theme) or not
  const isDark = item.textClass.includes('text-white');

  // Utility classes map based on contrast
  const styles: StyleConfig = {
    isDark,
    text: 'text-current',
    subtext: 'opacity-80',
    // Cards: slightly transparent layer suitable for the background
    card: isDark 
        ? 'bg-white/10 border border-white/10' 
        : 'bg-black/5 border border-black/5',
    // Card Alt: A slightly stronger contrast for emphasis
    cardAlt: isDark 
        ? 'bg-white/20 border border-white/20' 
        : 'bg-black/10 border border-black/10',
    accentBg: isDark ? 'bg-white/20' : 'bg-black/5',
    // Button: High contrast (Inverted)
    button: isDark 
        ? 'bg-white text-slate-900' 
        : 'bg-slate-900 text-white',
  };

  let sections: ReactNode[] = [];
  
  // SWITCH LOGIC FOR SPECIFIC CONTENT
  if (item.id === 'dev-solutions') {
      sections = DevSolutionsSections(styles, t);
  } else if (item.id === 'optimisation') {
      sections = OptimisationSections(styles, t);
  } else if (item.id === 'automatisation') {
      sections = AutomatisationSections(styles, t);
  } else if (item.id === 'conseil') {
      sections = ConseilSections(styles, t);
  } else if (item.id === 'data-analysis') {
      sections = DataAnalysisSections(styles, t);
  } else if (item.id === 'formation') {
      sections = FormationSections(styles, t);
  } else if (item.id === 'maintenance') {
      sections = MaintenanceSections(styles, t);
  } else if (item.id === 'finance') {
      sections = FinanceSections(styles, t);
  } else if (item.id === 'why-us') {
      sections = WhyUsSections(styles, t);
  } else if (item.id === 'team') {
      sections = TeamSections(styles, t);
  } else if (item.id === 'contact') {
      sections = ContactSections(styles, t);
  } else {
      sections = GenericSections(item, styles, t);
  }

  // Determine dot color for the scroll indicator
  const themeDotColor = isDark ? 'white' : 'black';

  // --- RENDER MODES ---

  // 1. Mobile & Portrait Flow Mode (Vertical List, No Scroll Snap)
  if (isMobile || isPortraitFlow) {
    return (
      <div className={`flex flex-col ${isPortraitFlow ? 'gap-20 md:gap-32' : ''}`}>
        {sections.map((section, idx) => (
          <div 
            key={idx} 
            className={`
                w-full 
                ${isMobile ? `p-6 border-b last:border-b-0 ${isDark ? 'border-white/10' : 'border-black/5'}` : ''}
                ${isPortraitFlow ? 'min-h-[400px] flex flex-col justify-center' : ''}
            `}
          >
             {section}
          </div>
        ))}
        {/* Extra padding at bottom for portrait flow */}
        {isPortraitFlow && <div className="h-40" />} 
      </div>
    );
  }

  // 2. Desktop Landscape Mode (Scroll Snap Container)
  return (
    <motion.div
      variants={contentVariants}
      initial="hidden"
      animate="visible"
      className="w-full h-full"
    >
      <ScrollableContainer sections={sections} themeColor={themeDotColor} />
    </motion.div>
  );
};

export default TileContent;