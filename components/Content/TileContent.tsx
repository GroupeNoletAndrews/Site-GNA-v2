import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle, CheckCircle, ChevronDown, Loader2, Mail, Phone, Send } from 'lucide-react';
import React, { ReactNode, useEffect, useRef, useState } from 'react';
import { useI18n } from '../../contexts/I18nContext';
import { GridItem } from '../../types';
interface TileContentProps {
  item: GridItem;
  isMobile?: boolean; // Mobile accordion rendering
  isPortraitFlow?: boolean; // NEW: Vertical Desktop Flow rendering
}

interface ResponsiveClasses {
  heading: string;
  subheading: string;
  body: string;
  padding: string;
  margin: string;
  gap: string;
}

interface StyleConfig {
  isDark: boolean;
  text: string;
  subtext: string;
  card: string;
  cardAlt: string;
  accentBg: string;
  button: string;
  responsive: ResponsiveClasses;
}

// --- HOOK POUR DÉTECTER LA HAUTEUR DE L'ÉCRAN ---
const useViewportHeight = () => {
  const [vh, setVh] = useState(window.innerHeight);

  useEffect(() => {
    const updateVh = () => setVh(window.innerHeight);
    window.addEventListener('resize', updateVh);
    return () => window.removeEventListener('resize', updateVh);
  }, []);

  return vh;
};

// --- FONCTION POUR GÉNÉRER DES CLASSES ADAPTATIVES SELON LA HAUTEUR ---
const getResponsiveClasses = (vh: number) => {
  // Pour les très petits écrans (hauteur < 600px)
  if (vh < 600) {
    return {
      heading: 'text-xl md:text-2xl lg:text-3xl xl:text-4xl',
      subheading: 'text-lg md:text-xl lg:text-2xl xl:text-3xl',
      body: 'text-sm md:text-base lg:text-lg',
      padding: 'p-4 md:p-6 xl:p-8',
      margin: 'mb-3 md:mb-4',
      gap: 'gap-4 md:gap-6',
    };
  }
  // Pour les petits écrans (600px - 800px)
  if (vh < 800) {
    return {
      heading: 'text-2xl md:text-3xl lg:text-4xl xl:text-5xl',
      subheading: 'text-xl md:text-2xl lg:text-3xl xl:text-4xl',
      body: 'text-base md:text-lg lg:text-xl',
      padding: 'p-6 md:p-8 xl:p-10',
      margin: 'mb-4 md:mb-6',
      gap: 'gap-4 md:gap-6 xl:gap-8',
    };
  }
  // Pour les écrans moyens (800px - 1000px)
  if (vh < 1000) {
    return {
      heading: 'text-3xl md:text-4xl lg:text-5xl xl:text-6xl',
      subheading: 'text-2xl md:text-3xl lg:text-4xl xl:text-5xl',
      body: 'text-lg md:text-xl lg:text-2xl',
      padding: 'p-8 md:p-10 xl:p-12',
      margin: 'mb-5 md:mb-8',
      gap: 'gap-6 md:gap-8 xl:gap-10',
    };
  }
  // Pour les grands écrans (>= 1000px) - taille par défaut
  return {
    heading: 'text-2xl md:text-3xl lg:text-5xl xl:text-6xl 2xl:text-7xl',
    subheading: 'text-xl md:text-2xl lg:text-4xl xl:text-5xl 2xl:text-6xl',
    body: 'text-base md:text-xl lg:text-2xl 2xl:text-3xl',
    padding: 'p-8 md:px-12 md:py-10 xl:px-20 xl:py-16 2xl:px-24 2xl:py-20',
    margin: 'mb-4 md:mb-6 2xl:mb-10',
    gap: 'gap-6 md:gap-8 xl:gap-12',
  };
};

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
  const vh = useViewportHeight();
  const responsiveClasses = getResponsiveClasses(vh);

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
      // Get the active section container (the one being scrolled)
      const activeSectionContainer = container.querySelector(`[data-section-index="${currentIndex}"]`) as HTMLElement;
      
      if (activeSectionContainer) {
        const { scrollTop, scrollHeight, clientHeight } = activeSectionContainer;
        const isAtTop = scrollTop === 0;
        const isAtBottom = Math.abs(scrollHeight - clientHeight - scrollTop) < 1;
        
        // Allow scroll within section if not at boundaries
        if (e.deltaY > 0 && !isAtBottom) {
          // Scrolling down but not at bottom - allow internal scroll
          return;
        }
        if (e.deltaY < 0 && !isAtTop) {
          // Scrolling up but not at top - allow internal scroll
          return;
        }
      }
      
      // Prevent default and handle section change only if at boundaries
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
          <div 
            key={idx} 
            data-section-index={idx}
            className={`w-full h-full flex flex-col ${responsiveClasses.padding} overflow-y-auto relative min-h-0`}
          >
            <div className="flex flex-col justify-center min-h-full pb-48 md:pb-56 lg:pb-64 xl:pb-72 2xl:pb-80">
             {section}
            </div>
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

const DevSolutionsSections = (s: StyleConfig, t: (key: string) => any) => {
  const r = s.responsive;
  return [
  // SECTION 1: INTRO
  <div className="h-full flex flex-col justify-center max-w-4xl 2xl:max-w-6xl" key="intro">
    <h3 className={`${r.heading} font-normal ${r.margin} ${s.text}`}>{t('dev-solutions.intro.heading')}</h3>
    <p className={`${r.body} leading-relaxed font-light ${s.subtext}`}>
      {t('dev-solutions.intro.description')}
    </p>
    <div className={`mt-4 md:mt-6 xl:mt-8 flex ${r.gap}`}>
        {(t('dev-solutions.intro.tags') as string[] || []).map((tag, i) => (
          <div key={i} className={`px-3 py-1.5 md:px-4 md:py-2 rounded-lg font-normal ${r.body} ${s.card}`}>{tag}</div>
        ))}
    </div>
  </div>,

  // SECTION 2: POINTS CLÉS
  <div className="h-full flex flex-col justify-center max-w-4xl 2xl:max-w-6xl" key="points">
    <h3 className={`${r.subheading} font-normal ${r.margin} ${s.text}`}>{t('dev-solutions.section2.heading')}</h3>
    <div className={`grid grid-cols-1 md:grid-cols-2 ${r.gap}`}>
       <div className={`space-y-4 md:space-y-6 xl:space-y-8`}>
          <div className={`flex items-start ${r.gap}`}>
              <div className={`w-8 h-8 md:w-10 md:h-10 xl:w-12 xl:h-12 rounded-full flex items-center justify-center font-normal shrink-0 ${s.accentBg} ${r.body}`}>01</div>
              <div>
                  <h4 className={`font-normal ${r.body} ${s.text}`}>{t('dev-solutions.section2.point1.title')}</h4>
                  <p className={`font-light ${r.body} ${s.subtext}`}>{t('dev-solutions.section2.point1.description')}</p>
              </div>
          </div>
          <div className={`flex items-start ${r.gap}`}>
              <div className={`w-8 h-8 md:w-10 md:h-10 xl:w-12 xl:h-12 rounded-full flex items-center justify-center font-normal shrink-0 ${s.accentBg} ${r.body}`}>02</div>
              <div>
                  <h4 className={`font-normal ${r.body} ${s.text}`}>{t('dev-solutions.section2.point2.title')}</h4>
                  <p className={`font-light ${r.body} ${s.subtext}`}>{t('dev-solutions.section2.point2.description')}</p>
              </div>
          </div>
       </div>
       <div className={`p-4 md:p-6 xl:p-8 rounded-2xl ${s.card} flex flex-col justify-center`}>
          <h4 className={`font-normal ${r.margin} ${r.body} ${s.text}`}>{t('dev-solutions.section2.card.title')}</h4>
          <p className={`font-light ${r.body} leading-relaxed ${s.subtext}`}>
              {t('dev-solutions.section2.card.description')}
          </p>
       </div>
    </div>
  </div>,

  // SECTION 3: CONCLUSION
  <div className="h-full flex flex-col justify-center items-center text-center max-w-4xl mx-auto" key="conclusion">
      <h3 className={`${r.subheading} font-normal ${r.margin} ${s.text}`}>{t('dev-solutions.section3.heading')}</h3>
      <div className={`p-6 md:p-8 xl:p-10 rounded-3xl ${s.cardAlt} relative overflow-hidden`}>
         <span className={`absolute top-2 left-4 ${r.heading} opacity-10 font-serif`}>"</span>
         <p className={`${r.body} font-light leading-relaxed relative z-10 ${s.text}`}>
           {t('dev-solutions.section3.quote')}
         </p>
      </div>
  </div>
  ];
};

const OptimisationSections = (s: StyleConfig, t: (key: string) => any) => {
  const r = s.responsive;
  return [
  // SECTION 1: INTRO
  <div className="h-full flex flex-col justify-center max-w-4xl 2xl:max-w-6xl" key="intro">
    <h3 className={`${r.heading} font-normal ${r.margin} ${s.text}`}>{t('optimisation.intro.heading')}</h3>
    <p className={`${r.body} leading-relaxed font-light ${s.subtext}`}>
      {t('optimisation.intro.description')}
    </p>
    <div className={`mt-4 md:mt-6 xl:mt-8 flex ${r.gap}`}>
        {(t('optimisation.intro.tags') as string[] || []).map((tag, i) => (
          <div key={i} className={`px-3 py-1.5 md:px-4 md:py-2 rounded-lg font-normal ${r.body} ${s.card}`}>{tag}</div>
        ))}
    </div>
  </div>,

  // SECTION 2: POINTS CLÉS
  <div className="h-full flex flex-col justify-center max-w-5xl 2xl:max-w-7xl" key="points">
    <h3 className={`${r.subheading} font-normal ${r.margin} ${s.text}`}>{t('optimisation.section2.heading')}</h3>
    <div className={`grid grid-cols-1 md:grid-cols-3 ${r.gap}`}>
       {/* Point 1 */}
       <div className={`${r.padding} rounded-2xl ${s.card} flex flex-col`}>
          <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center font-normal ${r.margin} shrink-0 ${s.accentBg} ${r.body}`}>01</div>
          <h4 className={`font-normal ${r.body} ${r.margin} ${s.text}`}>{t('optimisation.section2.point1.title')}</h4>
          <p className={`font-light ${r.body} leading-relaxed ${s.subtext}`}>
            {t('optimisation.section2.point1.description')}
          </p>
       </div>
       {/* Point 2 */}
       <div className={`${r.padding} rounded-2xl ${s.card} flex flex-col`}>
          <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center font-normal ${r.margin} shrink-0 ${s.accentBg} ${r.body}`}>02</div>
          <h4 className={`font-normal ${r.body} ${r.margin} ${s.text}`}>{t('optimisation.section2.point2.title')}</h4>
          <p className={`font-light ${r.body} leading-relaxed ${s.subtext}`}>
            {t('optimisation.section2.point2.description')}
          </p>
       </div>
       {/* Point 3 */}
       <div className={`${r.padding} rounded-2xl ${s.card} flex flex-col`}>
          <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center font-normal ${r.margin} shrink-0 ${s.accentBg} ${r.body}`}>03</div>
          <h4 className={`font-normal ${r.body} ${r.margin} ${s.text}`}>{t('optimisation.section2.point3.title')}</h4>
          <p className={`font-light ${r.body} leading-relaxed ${s.subtext}`}>
            {t('optimisation.section2.point3.description')}
          </p>
       </div>
    </div>
  </div>,

  // SECTION 3: CONCLUSION
  <div className="h-full flex flex-col justify-center items-center text-center max-w-4xl mx-auto" key="conclusion">
      <h3 className={`${r.subheading} font-normal ${r.margin} ${s.text}`}>{t('optimisation.section3.heading')}</h3>
      <div className={`p-6 md:p-8 xl:p-10 rounded-3xl ${s.cardAlt} relative overflow-hidden`}>
         <span className={`absolute top-2 left-4 ${r.heading} opacity-10 font-serif`}>"</span>
         <p className={`${r.body} font-light leading-relaxed relative z-10 ${s.text}`}>
           {t('optimisation.section3.quote')}
         </p>
      </div>
  </div>
  ];
};

const AutomatisationSections = (s: StyleConfig, t: (key: string) => any) => {
  const r = s.responsive;
  return [
  // SECTION 1: INTRO
  <div className="h-full flex flex-col justify-center max-w-4xl 2xl:max-w-6xl" key="intro">
    <h3 className={`${r.heading} font-normal ${r.margin} ${s.text}`}>{t('automatisation.intro.heading')}</h3>
    <p className={`${r.body} leading-relaxed font-light ${s.subtext}`}>
      {t('automatisation.intro.description')}
    </p>
    <div className={`mt-4 md:mt-6 xl:mt-8 flex ${r.gap}`}>
        {(t('automatisation.intro.tags') as string[] || []).map((tag, i) => (
          <div key={i} className={`px-3 py-1.5 md:px-4 md:py-2 rounded-lg font-normal ${r.body} ${s.card}`}>{tag}</div>
        ))}
    </div>
  </div>,

  // SECTION 2: POINTS CLÉS
  <div className="h-full flex flex-col justify-center max-w-5xl 2xl:max-w-7xl" key="points">
    <h3 className={`${r.subheading} font-normal ${r.margin} ${s.text}`}>{t('automatisation.section2.heading')}</h3>
    <div className={`grid grid-cols-1 md:grid-cols-3 ${r.gap}`}>
       <div className={`${r.padding} rounded-2xl ${s.card} flex flex-col`}>
          <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center font-normal ${r.margin} shrink-0 ${s.accentBg} ${r.body}`}>01</div>
          <h4 className={`font-normal ${r.body} ${r.margin} ${s.text}`}>{t('automatisation.section2.point1.title')}</h4>
          <p className={`font-light ${r.body} leading-relaxed ${s.subtext}`}>
            {t('automatisation.section2.point1.description')}
          </p>
       </div>
       <div className={`${r.padding} rounded-2xl ${s.card} flex flex-col`}>
          <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center font-normal ${r.margin} shrink-0 ${s.accentBg} ${r.body}`}>02</div>
          <h4 className={`font-normal ${r.body} ${r.margin} ${s.text}`}>{t('automatisation.section2.point2.title')}</h4>
          <p className={`font-light ${r.body} leading-relaxed ${s.subtext}`}>
            {t('automatisation.section2.point2.description')}
          </p>
       </div>
       <div className={`${r.padding} rounded-2xl ${s.card} flex flex-col`}>
          <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center font-normal ${r.margin} shrink-0 ${s.accentBg} ${r.body}`}>03</div>
          <h4 className={`font-normal ${r.body} ${r.margin} ${s.text}`}>{t('automatisation.section2.point3.title')}</h4>
          <p className={`font-light ${r.body} leading-relaxed ${s.subtext}`}>
            {t('automatisation.section2.point3.description')}
          </p>
       </div>
    </div>
  </div>,

  // SECTION 3: CONCLUSION
  <div className="h-full flex flex-col justify-center items-center text-center max-w-4xl mx-auto" key="conclusion">
      <h3 className={`${r.subheading} font-normal ${r.margin} ${s.text}`}>{t('automatisation.section3.heading')}</h3>
      <div className={`p-6 md:p-8 xl:p-10 rounded-3xl ${s.cardAlt} relative overflow-hidden`}>
         <span className={`absolute top-2 left-4 ${r.heading} opacity-10 font-serif`}>"</span>
         <p className={`${r.body} font-light leading-relaxed relative z-10 ${s.text}`}>
           {t('automatisation.section3.quote')}
         </p>
      </div>
  </div>
  ];
};

// Helper function for sections with 3 points layout
const createThreePointsSections = (s: StyleConfig, t: (key: string) => any, sectionKey: string) => {
  const r = s.responsive;
  return [
    // SECTION 1: INTRO
    <div className="h-full flex flex-col justify-center max-w-4xl 2xl:max-w-6xl" key="intro">
      <h3 className={`${r.heading} font-normal ${r.margin} ${s.text}`}>{t(`${sectionKey}.intro.heading`)}</h3>
      <p className={`${r.body} leading-relaxed font-light ${s.subtext}`}>
        {t(`${sectionKey}.intro.description`)}
      </p>
      <div className={`mt-4 md:mt-6 xl:mt-8 flex ${r.gap}`}>
          {(t(`${sectionKey}.intro.tags`) as string[] || []).map((tag, i) => (
            <div key={i} className={`px-3 py-1.5 md:px-4 md:py-2 rounded-lg font-normal ${r.body} ${s.card}`}>{tag}</div>
          ))}
      </div>
    </div>,

    // SECTION 2: POINTS CLÉS
    <div className="h-full flex flex-col justify-center max-w-5xl 2xl:max-w-7xl" key="points">
      <h3 className={`${r.subheading} font-normal ${r.margin} ${s.text}`}>{t(`${sectionKey}.section2.heading`)}</h3>
      <div className={`grid grid-cols-1 md:grid-cols-3 ${r.gap}`}>
         {[1, 2, 3].map((num) => (
           <div key={num} className={`${r.padding} rounded-2xl ${s.card} flex flex-col`}>
              <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center font-normal ${r.margin} shrink-0 ${s.accentBg} ${r.body}`}>0{num}</div>
              <h4 className={`font-normal ${r.body} ${r.margin} ${s.text}`}>{t(`${sectionKey}.section2.point${num}.title`)}</h4>
              <p className={`font-light ${r.body} leading-relaxed ${s.subtext}`}>
                {t(`${sectionKey}.section2.point${num}.description`)}
              </p>
           </div>
         ))}
      </div>
    </div>,

    // SECTION 3: CONCLUSION
    <div className="h-full flex flex-col justify-center items-center text-center max-w-4xl mx-auto" key="conclusion">
        <h3 className={`${r.subheading} font-normal ${r.margin} ${s.text}`}>{t(`${sectionKey}.section3.heading`)}</h3>
        <div className={`p-6 md:p-8 xl:p-10 rounded-3xl ${s.cardAlt} relative overflow-hidden`}>
           <span className={`absolute top-2 left-4 ${r.heading} opacity-10 font-serif`}>"</span>
           <p className={`${r.body} font-light leading-relaxed relative z-10 ${s.text}`}>
             {t(`${sectionKey}.section3.quote`)}
           </p>
        </div>
    </div>
  ];
};

const ConseilSections = (s: StyleConfig, t: (key: string) => any) => createThreePointsSections(s, t, 'conseil');
const DataAnalysisSections = (s: StyleConfig, t: (key: string) => any) => createThreePointsSections(s, t, 'data-analysis');
const FormationSections = (s: StyleConfig, t: (key: string) => any) => createThreePointsSections(s, t, 'formation');

// Helper function for sections with 2 points + card layout
const createTwoPointsCardSections = (s: StyleConfig, t: (key: string) => any, sectionKey: string) => {
  const r = s.responsive;
  return [
    // SECTION 1: INTRO
    <div className="h-full flex flex-col justify-center max-w-4xl 2xl:max-w-6xl" key="intro">
      <h3 className={`${r.heading} font-normal ${r.margin} ${s.text}`}>{t(`${sectionKey}.intro.heading`)}</h3>
      <p className={`${r.body} leading-relaxed font-light ${s.subtext}`}>
        {t(`${sectionKey}.intro.description`)}
      </p>
      <div className={`mt-4 md:mt-6 xl:mt-8 flex ${r.gap}`}>
          {(t(`${sectionKey}.intro.tags`) as string[] || []).map((tag, i) => (
            <div key={i} className={`px-3 py-1.5 md:px-4 md:py-2 rounded-lg font-normal ${r.body} ${s.card}`}>{tag}</div>
          ))}
      </div>
    </div>,

    // SECTION 2: POINTS CLÉS
    <div className="h-full flex flex-col justify-center max-w-4xl 2xl:max-w-6xl" key="points">
      <h3 className={`${r.subheading} font-normal ${r.margin} ${s.text}`}>{t(`${sectionKey}.section2.heading`)}</h3>
      <div className={`grid grid-cols-1 md:grid-cols-2 ${r.gap}`}>
         <div className={`space-y-4 md:space-y-6`}>
            {[1, 2].map((num) => (
              <div key={num} className={`flex items-start ${r.gap}`}>
                  <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center font-normal shrink-0 ${s.accentBg} ${r.body}`}>0{num}</div>
                  <div>
                      <h4 className={`font-normal ${r.body} ${s.text}`}>{t(`${sectionKey}.section2.point${num}.title`)}</h4>
                      <p className={`font-light ${r.body} ${s.subtext}`}>{t(`${sectionKey}.section2.point${num}.description`)}</p>
                  </div>
              </div>
            ))}
         </div>
         <div className={`${r.padding} rounded-2xl ${s.card} flex flex-col justify-center`}>
            <h4 className={`font-normal ${r.margin} ${r.body} ${s.text}`}>{t(`${sectionKey}.section2.card.title`)}</h4>
            <p className={`font-light ${r.body} leading-relaxed ${s.subtext}`}>
                {t(`${sectionKey}.section2.card.description`)}
            </p>
         </div>
      </div>
    </div>,

    // SECTION 3: CONCLUSION
    <div className="h-full flex flex-col justify-center items-center text-center max-w-4xl mx-auto" key="conclusion">
        <h3 className={`${r.subheading} font-normal ${r.margin} ${s.text}`}>{t(`${sectionKey}.section3.heading`)}</h3>
        <div className={`p-6 md:p-8 xl:p-10 rounded-3xl ${s.cardAlt} relative overflow-hidden`}>
           <span className={`absolute top-2 left-4 ${r.heading} opacity-10 font-serif`}>"</span>
           <p className={`${r.body} font-light leading-relaxed relative z-10 ${s.text}`}>
             {t(`${sectionKey}.section3.quote`)}
           </p>
        </div>
    </div>
  ];
};

const MaintenanceSections = (s: StyleConfig, t: (key: string) => any) => createTwoPointsCardSections(s, t, 'maintenance');
const FinanceSections = (s: StyleConfig, t: (key: string) => any) => createTwoPointsCardSections(s, t, 'finance');

const WhyUsSections = (s: StyleConfig, t: (key: string) => any) => {
  const r = s.responsive;
  return [
  // SECTION 1: INTRO
  <div className="h-full flex flex-col justify-center max-w-4xl 2xl:max-w-6xl" key="intro">
    <h3 className={`${r.heading} font-normal ${r.margin} ${s.text}`}>{t('why-us.intro.heading')}</h3>
    <p className={`${r.body} leading-relaxed font-light ${s.subtext}`}>
      {t('why-us.intro.question')}
      <br/><br/>
      {t('why-us.intro.description')}
    </p>
    <div className={`mt-4 md:mt-6 xl:mt-8 flex ${r.gap}`}>
        {(t('why-us.intro.tags') as string[] || []).map((tag, i) => (
          <div key={i} className={`px-3 py-1.5 md:px-4 md:py-2 rounded-lg font-normal ${r.body} ${s.card}`}>{tag}</div>
        ))}
    </div>
  </div>,

  // SECTION 2: POINTS CLÉS
  <div className="h-full flex flex-col justify-center max-w-6xl 2xl:max-w-7xl" key="points">
    <h3 className={`${r.subheading} font-normal ${r.margin} ${s.text}`}>{t('why-us.section2.heading')}</h3>
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 ${r.gap}`}>
       {((t('why-us.section2.points') as any[]) || []).map((p, i) => (
           <div key={i} className={`p-4 md:p-5 rounded-2xl ${s.card} flex flex-col`}>
              <h4 className={`font-normal ${r.body} mb-2 ${s.text}`}>{p.title}</h4>
              <p className={`font-light ${r.body} leading-relaxed ${s.subtext}`}>{p.description}</p>
           </div>
       ))}
    </div>
  </div>,

  // SECTION 3: CONCLUSION
  <div className="h-full flex flex-col justify-center items-center text-center max-w-4xl mx-auto" key="conclusion">
      <h3 className={`${r.subheading} font-normal ${r.margin} ${s.text}`}>{t('why-us.section3.heading')}</h3>
      <div className={`p-6 md:p-8 xl:p-10 rounded-3xl ${s.cardAlt} relative overflow-hidden`}>
         <span className={`absolute top-2 left-4 ${r.heading} opacity-10 font-serif`}>"</span>
         <p className={`${r.body} font-light leading-relaxed relative z-10 ${s.text}`}>
           {t('why-us.section3.quote')}
         </p>
      </div>
  </div>
  ];
};

const TeamSections = (s: StyleConfig, t: (key: string) => any) => {
    const r = s.responsive;
    const leadershipData = t('team.leadership.members') as any[] || [];
    const leadership = leadershipData.map((member, idx) => ({
      name: member.name,
      role: member.role,
      img: idx === 0 
        ? "/images/e-n.jpg"
        : "/images/p-a.jpg"
    }));
    
    const expertsData = t('team.experts.members') as any[] || [];
    const experts = expertsData.map((member, idx) => ({
        name: member.name,
        role: member.role,
        img: idx === 0
          ? "/images/j-c-a.jpg"
          : idx === 1
          ? "/images/e-a.jpg"
          : "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=800&auto=format&fit=crop"
    }));

    const portfolio = t('team.portfolio.projects') as any[] || [];

    return [
    <div className="h-full flex flex-col justify-center max-w-4xl 2xl:max-w-6xl" key="intro">
        <h3 className={`${r.heading} font-normal ${r.margin} ${s.text}`}>{t('team.intro.heading')}</h3>
        <p className={`${r.body} leading-relaxed font-light ${s.subtext}`}>
        {t('team.intro.description1')}
        <br/><br/>
        {t('team.intro.description2')}
        </p>
        <div className={`mt-4 md:mt-6 xl:mt-8 flex ${r.gap}`}>
            {(t('team.intro.tags') as string[] || []).map((tag, i) => (
              <div key={i} className={`px-3 py-1.5 md:px-4 md:py-2 rounded-lg font-normal ${r.body} ${s.card}`}>{tag}</div>
            ))}
        </div>
    </div>,

    <div className="h-full flex flex-col justify-center max-w-5xl 2xl:max-w-6xl" key="leadership">
        <h3 className={`${r.subheading} font-normal ${r.margin} ${s.text}`}>{t('team.leadership.heading')}</h3>
        <div className={`flex flex-col ${r.gap}`}>
            {leadership.map((member, idx) => (
                <div key={idx} className={`flex flex-col md:flex-row items-center ${r.gap} ${idx % 2 === 1 ? 'md:flex-row-reverse' : ''}`}>
                    <div className="w-32 h-32 md:w-40 md:h-40 xl:w-48 xl:h-48 rounded-2xl overflow-hidden shadow-lg relative group shrink-0">
                        <img src={member.img} alt={member.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 grayscale group-hover:grayscale-0" />
                        <div className={`absolute inset-0 ${s.accentBg} opacity-20 mix-blend-overlay`} />
                    </div>
                    <div className={`flex flex-col ${idx % 2 === 1 ? 'md:items-end md:text-right' : 'md:items-start md:text-left'} text-center md:text-left`}>
                        <h4 className={`${r.body} font-normal mb-1 ${s.text}`}>{member.name}</h4>
                        <p className={`${r.body} uppercase tracking-widest font-light opacity-70 ${s.text}`}>{member.role}</p>
                        <div className={`h-0.5 w-10 bg-current opacity-40 mt-2 md:mt-3 hidden md:block`} />
                    </div>
                </div>
            ))}
        </div>
    </div>,

    <div className="h-full flex flex-col justify-center max-w-6xl 2xl:max-w-7xl" key="experts">
        <h3 className={`${r.subheading} font-normal ${r.margin} ${s.text}`}>{t('team.experts.heading')}</h3>
        <div className={`flex flex-col ${r.gap}`}>
            {experts.map((member, idx) => (
                <div key={idx} className={`flex flex-col md:flex-row items-center ${r.gap} ${idx % 2 === 1 ? 'md:flex-row-reverse' : ''}`}>
                    <div className="w-24 h-24 md:w-28 md:h-28 xl:w-32 xl:h-32 rounded-full overflow-hidden shadow-md shrink-0 border-2 border-white/20">
                        <img src={member.img} alt={member.name} className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-500" />
                    </div>
                    <div className={`flex flex-col ${idx % 2 === 1 ? 'md:items-end md:text-right' : 'md:items-start md:text-left'} text-center md:text-left`}>
                        <h4 className={`${r.body} font-normal mb-1 ${s.text}`}>{member.name}</h4>
                        <p className={`${r.body} font-light opacity-70 uppercase tracking-wide ${s.text}`}>{member.role}</p>
                    </div>
                </div>
            ))}
        </div>
    </div>,

    // <div className="h-full flex flex-col justify-center max-w-6xl 2xl:max-w-7xl">
    //     <h3 className={`text-xl md:text-2xl lg:text-4xl xl:text-5xl font-normal mb-8 md:mb-12 ${s.text}`}>{t('team.portfolio.heading')}</h3>
    //     <div className="grid grid-cols-1 md:grid-cols-2 gap-6 xl:gap-8">
    //          {portfolio.map((project, idx) => (
    //          <div key={idx} className={`group relative rounded-2xl overflow-hidden aspect-video ${s.card} cursor-pointer`}>
    //              <img src={idx === 0 ? "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2000&auto=format&fit=crop" : "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2000&auto=format&fit=crop"} className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-opacity duration-500 grayscale group-hover:grayscale-0" />
    //              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
    //              <div className="absolute bottom-0 left-0 w-full p-6 md:p-8 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
    //                  <p className="text-xs uppercase tracking-widest text-white/70 mb-2">{project.category}</p>
    //                  <h4 className="text-xl md:text-2xl text-white font-normal flex items-center gap-3">
    //                      {project.title}
    //                      <ArrowRight className="w-5 h-5 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all duration-300" />
    //                  </h4>
    //              </div>
    //          </div>
    //          ))}
    //     </div>
    // </div>
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
          <label htmlFor="firstName" className={`text-xs uppercase tracking-widest opacity-90 ml-1 font-semibold text-white`}>{t('contact.form.fields.firstName')}</label>
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
          <label htmlFor="lastName" className={`text-xs uppercase tracking-widest opacity-90 ml-1 font-semibold text-white`}>{t('contact.form.fields.lastName')}</label>
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
          <label htmlFor="phone" className={`text-xs uppercase tracking-widest opacity-90 ml-1 font-semibold text-white`}>{t('contact.form.fields.phone')}</label>
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
          <label htmlFor="email" className={`text-xs uppercase tracking-widest opacity-90 ml-1 font-semibold text-white`}>{t('contact.form.fields.email')}</label>
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
          <label htmlFor="message" className={`text-xs uppercase tracking-widest opacity-90 ml-1 font-semibold text-white`}>{t('contact.form.fields.message')}</label>
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

const ContactSections = (s: StyleConfig, t: (key: string) => any) => {
  const r = s.responsive;
  return [
  // SECTION 1: Intro & Coordonnées
  <div className="h-full flex flex-col justify-center max-w-4xl 2xl:max-w-6xl" key="intro">
      <h3 className={`${r.heading} font-normal ${r.margin} ${s.text}`}>{t('contact.intro.heading')}</h3>
      <p className={`${r.body} leading-relaxed font-light ${r.margin} ${s.subtext}`}>
        {t('contact.intro.description')}
      </p>

      <div className={`grid grid-cols-1 md:grid-cols-2 ${r.gap}`}>
        <a href="mailto:info@noletandrews.ca" className={`${r.padding} rounded-2xl ${s.card} group transition-all hover:bg-white/20 flex flex-col ${r.gap}`}>
           <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full ${s.accentBg} flex items-center justify-center`}>
              <Mail className="w-5 h-5 md:w-6 md:h-6" />
           </div>
           <div>
              <p className={`text-xs uppercase tracking-widest opacity-70 mb-1`}>{t('contact.form.fields.email')}</p>
              <p className={`${r.body} font-medium`}>info@noletandrews.ca</p>
           </div>
        </a>
        <a href="tel:+15819868494" className={`${r.padding} rounded-2xl ${s.card} group transition-all hover:bg-white/20 flex flex-col ${r.gap}`}>
           <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full ${s.accentBg} flex items-center justify-center`}>
              <Phone className="w-5 h-5 md:w-6 md:h-6" />
           </div>
           <div>
              <p className={`text-xs uppercase tracking-widest opacity-70 mb-1`}>{t('contact.form.fields.phone')}</p>
              <p className={`${r.body} font-medium`}>+1 (581) 986-8494</p>
           </div>
        </a>
      </div>
  </div>,

  <ContactForm key="contact-form" styleConfig={s} t={t} />,

 
  ];
};

const GenericSections = (item: GridItem, s: StyleConfig, t: (key: string, tile?: string) => any) => {
  const r = s.responsive;
  return [
  <div className="h-full flex flex-col justify-center max-w-3xl 2xl:max-w-5xl" key="intro">
    <h3 className={`${r.heading} font-light ${r.margin} ${s.text}`}>{t('common.generic.intro.heading')}</h3>
    <p className={`${r.body} font-light leading-relaxed ${r.margin} ${s.subtext}`}>
      {item.description}
      <br/><br/>
      {t('common.generic.intro.description')} <span className="font-normal opacity-100">{item.title}</span>.
    </p>
    <div className={`h-1 w-20 mt-2 md:mt-4 bg-current opacity-80`} />
  </div>,

  <div className="h-full flex flex-col justify-center max-w-4xl 2xl:max-w-6xl" key="section2">
      <h3 className={`${r.subheading} font-normal ${r.margin} ${s.text}`}>{t('common.generic.section2.heading')}</h3>
      <div className={`grid grid-cols-1 md:grid-cols-2 ${r.gap}`}>
        <div className={`${r.padding} rounded-2xl ${s.card}`}>
           <h4 className={`${r.body} font-normal ${r.margin} ${s.text}`}>{t('common.generic.section2.expertise.title')}</h4>
           <p className={`${r.body} font-light ${s.subtext}`}>{t('common.generic.section2.expertise.description')}</p>
        </div>
        <div className={`${r.padding} rounded-2xl ${s.card}`}>
           <h4 className={`${r.body} font-normal ${r.margin} ${s.text}`}>{t('common.generic.section2.innovation.title')}</h4>
           <p className={`${r.body} font-light ${s.subtext}`}>{t('common.generic.section2.innovation.description')}</p>
        </div>
      </div>
  </div>,
  
  <div className="h-full flex flex-col justify-center items-center text-center max-w-2xl 2xl:max-w-4xl mx-auto" key="section3">
      <h3 className={`${r.heading} font-normal ${r.margin} ${s.text}`}>{t('common.generic.section3.heading')}</h3>
      <p className={`${r.body} ${r.margin} font-light ${s.subtext}`}>
          {t('common.generic.section3.description')} {item.title} {t('common.generic.section3.descriptionEnd')}
      </p>
      <button className={`px-4 py-2 md:px-6 md:py-3 rounded-full font-normal shadow-lg ${r.body} transition-transform hover:scale-105 ${s.button}`}>
          {t('common.generic.section3.button')}
      </button>
  </div>
  ];
};

/**
 * TileContent Manager
 */
const TileContent: React.FC<TileContentProps> = ({ item, isMobile = false, isPortraitFlow = false }) => {
  const { t } = useI18n();
  const vh = useViewportHeight();
  const responsiveClasses = getResponsiveClasses(vh);
  
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
    responsive: responsiveClasses,
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