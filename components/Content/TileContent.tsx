import React, { useState, useEffect, useRef, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GridItem } from '../../types';
import { ChevronDown, ArrowRight, Mail, Phone, Send, MessageSquare } from 'lucide-react';

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
            aria-label={`Aller à la section ${idx + 1}`}
          >
            <div className={`absolute right-full mr-2 px-2 py-1 backdrop-blur-md rounded text-[10px] opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none font-light shadow-sm ${themeColor === 'white' ? 'bg-white/20 text-white' : 'bg-black/10 text-slate-900'}`}>
               Section {idx + 1}
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
                <span className="text-xs uppercase tracking-widest font-normal">Scrollez</span>
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

const DevSolutionsSections = (s: StyleConfig) => [
  // SECTION 1: INTRO
  <div className="h-full flex flex-col justify-center max-w-4xl 2xl:max-w-6xl">
    <h3 className={`text-2xl md:text-3xl lg:text-5xl xl:text-6xl 2xl:text-7xl font-normal mb-4 md:mb-6 2xl:mb-10 ${s.text}`}>Solutions Numériques</h3>
    <p className={`text-base md:text-xl lg:text-2xl 2xl:text-3xl leading-relaxed font-light ${s.subtext}`}>
      Chaque entreprise est unique, et ses besoins technologiques le sont tout autant. Nous concevons des solutions numériques personnalisées qui s’intègrent parfaitement à votre réalité et soutiennent vos objectifs d’affaires.
    </p>
    <div className="mt-8 md:mt-12 flex gap-4">
        <div className={`px-4 py-2 md:px-6 md:py-3 rounded-lg font-normal text-sm md:text-base xl:text-lg 2xl:text-xl ${s.card}`}>Sur Mesure</div>
        <div className={`px-4 py-2 md:px-6 md:py-3 rounded-lg font-normal text-sm md:text-base xl:text-lg 2xl:text-xl ${s.card}`}>Stratégique</div>
    </div>
  </div>,

  // SECTION 2: POINTS CLÉS
  <div className="h-full flex flex-col justify-center max-w-4xl 2xl:max-w-6xl">
    <h3 className={`text-xl md:text-2xl lg:text-4xl xl:text-5xl 2xl:text-6xl font-normal mb-6 md:mb-10 ${s.text}`}>Une Approche Adaptée</h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 xl:gap-12">
       <div className="space-y-6 xl:space-y-10">
          <div className="flex items-start gap-4 xl:gap-6">
              <div className={`w-10 h-10 md:w-12 md:h-12 xl:w-16 xl:h-16 rounded-full flex items-center justify-center font-normal shrink-0 ${s.accentBg} text-base xl:text-xl`}>01</div>
              <div>
                  <h4 className={`font-normal text-base md:text-lg xl:text-2xl ${s.text}`}>Outils de gestion adaptés</h4>
                  <p className={`font-light text-sm md:text-base xl:text-lg ${s.subtext}`}>Nous développons des applications internes ou des plateformes spécialisées qui répondent à vos processus spécifiques et améliorent votre efficacité.</p>
              </div>
          </div>
          <div className="flex items-start gap-4 xl:gap-6">
              <div className={`w-10 h-10 md:w-12 md:h-12 xl:w-16 xl:h-16 rounded-full flex items-center justify-center font-normal shrink-0 ${s.accentBg} text-base xl:text-xl`}>02</div>
              <div>
                  <h4 className={`font-normal text-base md:text-lg xl:text-2xl ${s.text}`}>Solutions évolutives</h4>
                  <p className={`font-light text-sm md:text-base xl:text-lg ${s.subtext}`}>Nos développements sont pensés pour s’adapter à la croissance de votre entreprise et aux nouvelles exigences de votre marché.</p>
              </div>
          </div>
       </div>
       <div className={`p-6 xl:p-8 rounded-2xl ${s.card} flex flex-col justify-center`}>
          <h4 className={`font-normal mb-4 text-base md:text-lg xl:text-2xl ${s.text}`}>Intégration fluide</h4>
          <p className={`font-light text-sm md:text-base xl:text-lg leading-relaxed ${s.subtext}`}>
              Nous veillons à ce que chaque solution déployée s’harmonise avec vos systèmes existants, garantissant une transition simple et une adoption rapide par vos équipes.
          </p>
       </div>
    </div>
  </div>,

  // SECTION 3: CONCLUSION
  <div className="h-full flex flex-col justify-center items-center text-center max-w-4xl mx-auto">
      <h3 className={`text-xl md:text-2xl lg:text-4xl xl:text-5xl font-normal mb-8 md:mb-12 ${s.text}`}>Impact Durable</h3>
      <div className={`p-8 md:p-12 rounded-3xl ${s.cardAlt} relative overflow-hidden`}>
         <span className="absolute top-4 left-6 text-6xl md:text-8xl opacity-10 font-serif">"</span>
         <p className={`text-lg md:text-2xl xl:text-3xl font-light leading-relaxed relative z-10 ${s.text}`}>
           Développer des solutions digitales sur mesure, c’est transformer vos défis opérationnels en opportunités d’innovation et de performance durable.
         </p>
      </div>
  </div>
];

const OptimisationSections = (s: StyleConfig) => [
  // SECTION 1: INTRO
  <div className="h-full flex flex-col justify-center max-w-4xl 2xl:max-w-6xl">
    <h3 className={`text-2xl md:text-3xl lg:text-5xl xl:text-6xl 2xl:text-7xl font-normal mb-4 md:mb-6 2xl:mb-10 ${s.text}`}>Performance & Modernité</h3>
    <p className={`text-base md:text-xl lg:text-2xl 2xl:text-3xl leading-relaxed font-light ${s.subtext}`}>
      L’optimisation et la modernisation de votre présence web sont des piliers essentiels pour assurer la performance, la crédibilité et la compétitivité de votre entreprise en ligne. Notre approche combine analyse technique, design, expérience utilisateur (UX) et référencement naturel (SEO) afin de maximiser vos résultats numériques.
    </p>
    <div className="mt-8 md:mt-12 flex gap-4">
        <div className={`px-4 py-2 md:px-6 md:py-3 rounded-lg font-normal text-sm md:text-base xl:text-lg 2xl:text-xl ${s.card}`}>UX/UI Design</div>
        <div className={`px-4 py-2 md:px-6 md:py-3 rounded-lg font-normal text-sm md:text-base xl:text-lg 2xl:text-xl ${s.card}`}>SEO Technique</div>
    </div>
  </div>,

  // SECTION 2: POINTS CLÉS
  <div className="h-full flex flex-col justify-center max-w-5xl 2xl:max-w-7xl">
    <h3 className={`text-xl md:text-2xl lg:text-4xl xl:text-5xl 2xl:text-6xl font-normal mb-6 md:mb-10 ${s.text}`}>Notre Approche</h3>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-6 xl:gap-8">
       {/* Point 1 */}
       <div className={`p-6 xl:p-8 rounded-2xl ${s.card} flex flex-col`}>
          <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center font-normal mb-4 shrink-0 ${s.accentBg} text-base`}>01</div>
          <h4 className={`font-normal text-lg xl:text-2xl mb-3 ${s.text}`}>Design & Performance</h4>
          <p className={`font-light text-sm md:text-base leading-relaxed ${s.subtext}`}>
            Un site au visuel soigné et contemporain reflète l’image de votre entreprise. Nous repensons l’interface pour qu’elle soit attrayante et alignée avec votre identité, tout en garantissant une vitesse de chargement optimale.
          </p>
       </div>
       {/* Point 2 */}
       <div className={`p-6 xl:p-8 rounded-2xl ${s.card} flex flex-col`}>
          <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center font-normal mb-4 shrink-0 ${s.accentBg} text-base`}>02</div>
          <h4 className={`font-normal text-lg xl:text-2xl mb-3 ${s.text}`}>UX & Mobile</h4>
          <p className={`font-light text-sm md:text-base leading-relaxed ${s.subtext}`}>
            Nous repensons la navigation pour une expérience simple et intuitive. Votre site sera parfaitement responsive et accessible sur tous les appareils, du téléphone à l'ordinateur.
          </p>
       </div>
       {/* Point 3 */}
       <div className={`p-6 xl:p-8 rounded-2xl ${s.card} flex flex-col`}>
          <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center font-normal mb-4 shrink-0 ${s.accentBg} text-base`}>03</div>
          <h4 className={`font-normal text-lg xl:text-2xl mb-3 ${s.text}`}>SEO & Sécurité</h4>
          <p className={`font-light text-sm md:text-base leading-relaxed ${s.subtext}`}>
            Optimisation du code et du contenu pour les moteurs de recherche. Mise à jour de l’infrastructure et des protocoles de sécurité pour une fiabilité totale.
          </p>
       </div>
    </div>
  </div>,

  // SECTION 3: CONCLUSION
  <div className="h-full flex flex-col justify-center items-center text-center max-w-4xl mx-auto">
      <h3 className={`text-xl md:text-2xl lg:text-4xl xl:text-5xl font-normal mb-8 md:mb-12 ${s.text}`}>Performance & Conversion</h3>
      <div className={`p-8 md:p-12 rounded-3xl ${s.cardAlt} relative overflow-hidden`}>
         <span className="absolute top-4 left-6 text-6xl md:text-8xl opacity-10 font-serif">"</span>
         <p className={`text-lg md:text-2xl xl:text-3xl font-light leading-relaxed relative z-10 ${s.text}`}>
           Transformer votre site en un outil de performance moderne qui attire, engage et convertit : voilà notre objectif.
         </p>
      </div>
  </div>
];

const AutomatisationSections = (s: StyleConfig) => [
  // SECTION 1: INTRO
  <div className="h-full flex flex-col justify-center max-w-4xl 2xl:max-w-6xl">
    <h3 className={`text-2xl md:text-3xl lg:text-5xl xl:text-6xl 2xl:text-7xl font-normal mb-4 md:mb-6 2xl:mb-10 ${s.text}`}>Efficacité Opérationnelle</h3>
    <p className={`text-base md:text-xl lg:text-2xl 2xl:text-3xl leading-relaxed font-light ${s.subtext}`}>
      L’automatisation est un levier puissant pour accroître l’efficacité et libérer du temps précieux au sein des entreprises. Nous vous accompagnons dans l’intégration de solutions numériques qui simplifient vos processus, réduisent les erreurs et augmentent la productivité de vos équipes.
    </p>
    <div className="mt-8 md:mt-12 flex gap-4">
        <div className={`px-4 py-2 md:px-6 md:py-3 rounded-lg font-normal text-sm md:text-base xl:text-lg 2xl:text-xl ${s.card}`}>Productivité</div>
        <div className={`px-4 py-2 md:px-6 md:py-3 rounded-lg font-normal text-sm md:text-base xl:text-lg 2xl:text-xl ${s.card}`}>Intelligence</div>
    </div>
  </div>,

  // SECTION 2: POINTS CLÉS
  <div className="h-full flex flex-col justify-center max-w-5xl 2xl:max-w-7xl">
    <h3 className={`text-xl md:text-2xl lg:text-4xl xl:text-5xl 2xl:text-6xl font-normal mb-6 md:mb-10 ${s.text}`}>Nos Interventions</h3>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-6 xl:gap-8">
       {/* Point 1 */}
       <div className={`p-6 xl:p-8 rounded-2xl ${s.card} flex flex-col`}>
          <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center font-normal mb-4 shrink-0 ${s.accentBg} text-base`}>01</div>
          <h4 className={`font-normal text-lg xl:text-2xl mb-3 ${s.text}`}>Processus répétitifs</h4>
          <p className={`font-light text-sm md:text-base leading-relaxed ${s.subtext}`}>
            Nous identifions les tâches à faible valeur ajoutée et mettons en place des solutions pour les exécuter automatiquement.
          </p>
       </div>
       {/* Point 2 */}
       <div className={`p-6 xl:p-8 rounded-2xl ${s.card} flex flex-col`}>
          <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center font-normal mb-4 shrink-0 ${s.accentBg} text-base`}>02</div>
          <h4 className={`font-normal text-lg xl:text-2xl mb-3 ${s.text}`}>Outils collaboratifs</h4>
          <p className={`font-light text-sm md:text-base leading-relaxed ${s.subtext}`}>
            Nous déployons des plateformes modernes (CRM, outils de gestion, solutions collaboratives) pour centraliser l’information et améliorer la communication interne.
          </p>
       </div>
       {/* Point 3 */}
       <div className={`p-6 xl:p-8 rounded-2xl ${s.card} flex flex-col`}>
          <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center font-normal mb-4 shrink-0 ${s.accentBg} text-base`}>03</div>
          <h4 className={`font-normal text-lg xl:text-2xl mb-3 ${s.text}`}>Flux de travail</h4>
          <p className={`font-light text-sm md:text-base leading-relaxed ${s.subtext}`}>
            Nous analysons vos méthodes actuelles afin de concevoir des workflows plus fluides, plus rapides et mieux adaptés à vos objectifs d’affaires.
          </p>
       </div>
    </div>
  </div>,

  // SECTION 3: CONCLUSION
  <div className="h-full flex flex-col justify-center items-center text-center max-w-4xl mx-auto">
      <h3 className={`text-xl md:text-2xl lg:text-4xl xl:text-5xl font-normal mb-8 md:mb-12 ${s.text}`}>Libérez votre potentiel</h3>
      <div className={`p-8 md:p-12 rounded-3xl ${s.cardAlt} relative overflow-hidden`}>
         <span className="absolute top-4 left-6 text-6xl md:text-8xl opacity-10 font-serif">"</span>
         <p className={`text-lg md:text-2xl xl:text-3xl font-light leading-relaxed relative z-10 ${s.text}`}>
           Automatiser et optimiser vos processus, c’est donner à vos équipes plus de temps pour se concentrer sur ce qui compte vraiment : l’innovation, la croissance et la satisfaction de vos clients.
         </p>
      </div>
  </div>
];

const ConseilSections = (s: StyleConfig) => [
  // SECTION 1: INTRO
  <div className="h-full flex flex-col justify-center max-w-4xl 2xl:max-w-6xl">
    <h3 className={`text-2xl md:text-3xl lg:text-5xl xl:text-6xl 2xl:text-7xl font-normal mb-4 md:mb-6 2xl:mb-10 ${s.text}`}>Vision Stratégique</h3>
    <p className={`text-base md:text-xl lg:text-2xl 2xl:text-3xl leading-relaxed font-light ${s.subtext}`}>
      Les conseils d’affaires et la consultation stratégique sont au cœur de la croissance durable d’une entreprise. Notre rôle est de vous accompagner dans vos décisions clés en vous offrant une vision claire, des outils concrets et un plan d’action aligné sur vos objectifs.
    </p>
    <div className="mt-8 md:mt-12 flex gap-4">
        <div className={`px-4 py-2 md:px-6 md:py-3 rounded-lg font-normal text-sm md:text-base xl:text-lg 2xl:text-xl ${s.card}`}>Croissance</div>
        <div className={`px-4 py-2 md:px-6 md:py-3 rounded-lg font-normal text-sm md:text-base xl:text-lg 2xl:text-xl ${s.card}`}>Rentabilité</div>
    </div>
  </div>,

  // SECTION 2: POINTS CLÉS
  <div className="h-full flex flex-col justify-center max-w-5xl 2xl:max-w-7xl">
    <h3 className={`text-xl md:text-2xl lg:text-4xl xl:text-5xl 2xl:text-6xl font-normal mb-6 md:mb-10 ${s.text}`}>Axes Stratégiques</h3>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-6 xl:gap-8">
       {/* Point 1 */}
       <div className={`p-6 xl:p-8 rounded-2xl ${s.card} flex flex-col`}>
          <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center font-normal mb-4 shrink-0 ${s.accentBg} text-base`}>01</div>
          <h4 className={`font-normal text-lg xl:text-2xl mb-3 ${s.text}`}>Analyse & Diagnostic</h4>
          <p className={`font-light text-sm md:text-base leading-relaxed ${s.subtext}`}>
            Nous étudions votre environnement d’affaires, vos concurrents et vos opportunités afin de définir les leviers de croissance les plus pertinents.
          </p>
       </div>
       {/* Point 2 */}
       <div className={`p-6 xl:p-8 rounded-2xl ${s.card} flex flex-col`}>
          <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center font-normal mb-4 shrink-0 ${s.accentBg} text-base`}>02</div>
          <h4 className={`font-normal text-lg xl:text-2xl mb-3 ${s.text}`}>Planification</h4>
          <p className={`font-light text-sm md:text-base leading-relaxed ${s.subtext}`}>
            Nous vous aidons à bâtir une feuille de route claire, avec des étapes mesurables, afin que vos initiatives numériques et organisationnelles soutiennent vos objectifs d’affaires.
          </p>
       </div>
       {/* Point 3 */}
       <div className={`p-6 xl:p-8 rounded-2xl ${s.card} flex flex-col`}>
          <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center font-normal mb-4 shrink-0 ${s.accentBg} text-base`}>03</div>
          <h4 className={`font-normal text-lg xl:text-2xl mb-3 ${s.text}`}>Optimisation</h4>
          <p className={`font-light text-sm md:text-base leading-relaxed ${s.subtext}`}>
            En repensant vos méthodes de travail et vos outils, nous améliorons l’efficacité et la rentabilité de votre entreprise tout en réduisant les frictions opérationnelles.
          </p>
       </div>
    </div>
  </div>,

  // SECTION 3: CONCLUSION
  <div className="h-full flex flex-col justify-center items-center text-center max-w-4xl mx-auto">
      <h3 className={`text-xl md:text-2xl lg:text-4xl xl:text-5xl font-normal mb-8 md:mb-12 ${s.text}`}>Partenariat Durable</h3>
      <div className={`p-8 md:p-12 rounded-3xl ${s.cardAlt} relative overflow-hidden`}>
         <span className="absolute top-4 left-6 text-6xl md:text-8xl opacity-10 font-serif">"</span>
         <p className={`text-lg md:text-2xl xl:text-3xl font-light leading-relaxed relative z-10 ${s.text}`}>
           La consultation n’est pas seulement un accompagnement : c’est un partenariat qui vous permet de prendre de meilleures décisions et de transformer vos ambitions en résultats tangibles.
         </p>
      </div>
  </div>
];

const DataAnalysisSections = (s: StyleConfig) => [
  // SECTION 1: INTRO
  <div className="h-full flex flex-col justify-center max-w-4xl 2xl:max-w-6xl">
    <h3 className={`text-2xl md:text-3xl lg:text-5xl xl:text-6xl 2xl:text-7xl font-normal mb-4 md:mb-6 2xl:mb-10 ${s.text}`}>Clarté Décisionnelle</h3>
    <p className={`text-base md:text-xl lg:text-2xl 2xl:text-3xl leading-relaxed font-light ${s.subtext}`}>
      L’analyse de données et l’intelligence d’affaires permettent aux entreprises de transformer l’information brute en leviers stratégiques. Notre objectif est de vous aider à mieux comprendre vos activités et à orienter vos décisions grâce à des solutions claires, visuelles et adaptées à votre réalité.
    </p>
    <div className="mt-8 md:mt-12 flex gap-4">
        <div className={`px-4 py-2 md:px-6 md:py-3 rounded-lg font-normal text-sm md:text-base xl:text-lg 2xl:text-xl ${s.card}`}>Intelligence</div>
        <div className={`px-4 py-2 md:px-6 md:py-3 rounded-lg font-normal text-sm md:text-base xl:text-lg 2xl:text-xl ${s.card}`}>Visualisation</div>
    </div>
  </div>,

  // SECTION 2: POINTS CLÉS
  <div className="h-full flex flex-col justify-center max-w-5xl 2xl:max-w-7xl">
    <h3 className={`text-xl md:text-2xl lg:text-4xl xl:text-5xl 2xl:text-6xl font-normal mb-6 md:mb-10 ${s.text}`}>Notre Expertise</h3>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-6 xl:gap-8">
       {/* Point 1 */}
       <div className={`p-6 xl:p-8 rounded-2xl ${s.card} flex flex-col`}>
          <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center font-normal mb-4 shrink-0 ${s.accentBg} text-base`}>01</div>
          <h4 className={`font-normal text-lg xl:text-2xl mb-3 ${s.text}`}>Évaluation des données</h4>
          <p className={`font-light text-sm md:text-base leading-relaxed ${s.subtext}`}>
            Nous étudions, structurons et organisons vos données afin de révéler des tendances et des indicateurs pertinents pour votre entreprise.
          </p>
       </div>
       {/* Point 2 */}
       <div className={`p-6 xl:p-8 rounded-2xl ${s.card} flex flex-col`}>
          <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center font-normal mb-4 shrink-0 ${s.accentBg} text-base`}>02</div>
          <h4 className={`font-normal text-lg xl:text-2xl mb-3 ${s.text}`}>Tableaux de bord</h4>
          <p className={`font-light text-sm md:text-base leading-relaxed ${s.subtext}`}>
            Nous développons des outils visuels et dynamiques qui permettent de suivre vos performances en temps réel et de simplifier la lecture de l’information clé.
          </p>
       </div>
       {/* Point 3 */}
       <div className={`p-6 xl:p-8 rounded-2xl ${s.card} flex flex-col`}>
          <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center font-normal mb-4 shrink-0 ${s.accentBg} text-base`}>03</div>
          <h4 className={`font-normal text-lg xl:text-2xl mb-3 ${s.text}`}>Sur mesure</h4>
          <p className={`font-light text-sm md:text-base leading-relaxed ${s.subtext}`}>
            Nous concevons des solutions adaptées à vos besoins afin que chaque décision s’appuie sur des données fiables et exploitables.
          </p>
       </div>
    </div>
  </div>,

  // SECTION 3: CONCLUSION
  <div className="h-full flex flex-col justify-center items-center text-center max-w-4xl mx-auto">
      <h3 className={`text-xl md:text-2xl lg:text-4xl xl:text-5xl font-normal mb-8 md:mb-12 ${s.text}`}>Insights Stratégiques</h3>
      <div className={`p-8 md:p-12 rounded-3xl ${s.cardAlt} relative overflow-hidden`}>
         <span className="absolute top-4 left-6 text-6xl md:text-8xl opacity-10 font-serif">"</span>
         <p className={`text-lg md:text-2xl xl:text-3xl font-light leading-relaxed relative z-10 ${s.text}`}>
           Avec l’analyse de données et l’intelligence d’affaires, vos choix ne reposent plus sur l’intuition seule : ils sont guidés par des faits mesurables et des insights stratégiques.
         </p>
      </div>
  </div>
];

const FormationSections = (s: StyleConfig) => [
  // SECTION 1: INTRO
  <div className="h-full flex flex-col justify-center max-w-4xl 2xl:max-w-6xl">
    <h3 className={`text-2xl md:text-3xl lg:text-5xl xl:text-6xl 2xl:text-7xl font-normal mb-4 md:mb-6 2xl:mb-10 ${s.text}`}>Capital Humain</h3>
    <p className={`text-base md:text-xl lg:text-2xl 2xl:text-3xl leading-relaxed font-light ${s.subtext}`}>
      La réussite d’une entreprise repose autant sur les technologies que sur la force de ses équipes. Chez Groupe Nolet & Andrews, nous offrons des programmes de formation et un accompagnement adaptés qui renforcent les compétences de vos employés et dirigeants. Qu’il s’agisse de gestion, d’opérations ou d’outils numériques, nous sommes là pour vous guider.
    </p>
    <div className="mt-8 md:mt-12 flex gap-4">
        <div className={`px-4 py-2 md:px-6 md:py-3 rounded-lg font-normal text-sm md:text-base xl:text-lg 2xl:text-xl ${s.card}`}>Compétences</div>
        <div className={`px-4 py-2 md:px-6 md:py-3 rounded-lg font-normal text-sm md:text-base xl:text-lg 2xl:text-xl ${s.card}`}>Autonomie</div>
    </div>
  </div>,

  // SECTION 2: POINTS CLÉS
  <div className="h-full flex flex-col justify-center max-w-5xl 2xl:max-w-7xl">
    <h3 className={`text-xl md:text-2xl lg:text-4xl xl:text-5xl 2xl:text-6xl font-normal mb-6 md:mb-10 ${s.text}`}>Notre Pédagogie</h3>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-6 xl:gap-8">
       {/* Point 1 */}
       <div className={`p-6 xl:p-8 rounded-2xl ${s.card} flex flex-col`}>
          <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center font-normal mb-4 shrink-0 ${s.accentBg} text-base`}>01</div>
          <h4 className={`font-normal text-lg xl:text-2xl mb-3 ${s.text}`}>Formations spécialisées</h4>
          <p className={`font-light text-sm md:text-base leading-relaxed ${s.subtext}`}>
            Des contenus adaptés à votre secteur et à vos besoins réels, pour maximiser l’impact et la rétention des apprentissages.
          </p>
       </div>
       {/* Point 2 */}
       <div className={`p-6 xl:p-8 rounded-2xl ${s.card} flex flex-col`}>
          <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center font-normal mb-4 shrink-0 ${s.accentBg} text-base`}>02</div>
          <h4 className={`font-normal text-lg xl:text-2xl mb-3 ${s.text}`}>Ateliers pratiques</h4>
          <p className={`font-light text-sm md:text-base leading-relaxed ${s.subtext}`}>
            Nous privilégions des sessions interactives qui privilégient l’action et permettent aux participants d’appliquer immédiatement leurs nouvelles connaissances.
          </p>
       </div>
       {/* Point 3 */}
       <div className={`p-6 xl:p-8 rounded-2xl ${s.card} flex flex-col`}>
          <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center font-normal mb-4 shrink-0 ${s.accentBg} text-base`}>03</div>
          <h4 className={`font-normal text-lg xl:text-2xl mb-3 ${s.text}`}>Accompagnement continu</h4>
          <p className={`font-light text-sm md:text-base leading-relaxed ${s.subtext}`}>
            Nous restons disponibles pour donner un soutien durable, au-delà des formations, pour assurer l’autonomie, la confiance et la performance de vos équipes.
          </p>
       </div>
    </div>
  </div>,

  // SECTION 3: CONCLUSION
  <div className="h-full flex flex-col justify-center items-center text-center max-w-4xl mx-auto">
      <h3 className={`text-xl md:text-2xl lg:text-4xl xl:text-5xl font-normal mb-8 md:mb-12 ${s.text}`}>Savoir & Performance</h3>
      <div className={`p-8 md:p-12 rounded-3xl ${s.cardAlt} relative overflow-hidden`}>
         <span className="absolute top-4 left-6 text-6xl md:text-8xl opacity-10 font-serif">"</span>
         <p className={`text-lg md:text-2xl xl:text-3xl font-light leading-relaxed relative z-10 ${s.text}`}>
           Former et accompagner vos équipes, c’est leur donner les outils humains et numériques pour s’adapter, évoluer et transformer la technologie en véritable moteur de performance.
         </p>
      </div>
  </div>
];

const MaintenanceSections = (s: StyleConfig) => [
  // SECTION 1: INTRO
  <div className="h-full flex flex-col justify-center max-w-4xl 2xl:max-w-6xl">
    <h3 className={`text-2xl md:text-3xl lg:text-5xl xl:text-6xl 2xl:text-7xl font-normal mb-4 md:mb-6 2xl:mb-10 ${s.text}`}>Maintenance Logicielle</h3>
    <p className={`text-base md:text-xl lg:text-2xl 2xl:text-3xl leading-relaxed font-light ${s.subtext}`}>
      Les systèmes numériques évoluent, et leur stabilité est aussi stratégique que leur conception.
      Nous offrons des services de maintenance logicielle flexibles et rigoureux, autant pour nos propres solutions que pour des logiciels existants, afin d’assurer performance, sécurité et continuité opérationnelle.
    </p>
    <div className="mt-8 md:mt-12 flex gap-4">
        <div className={`px-4 py-2 md:px-6 md:py-3 rounded-lg font-normal text-sm md:text-base xl:text-lg 2xl:text-xl ${s.card}`}>Court Terme</div>
        <div className={`px-4 py-2 md:px-6 md:py-3 rounded-lg font-normal text-sm md:text-base xl:text-lg 2xl:text-xl ${s.card}`}>Long Terme</div>
    </div>
  </div>,

  // SECTION 2: POINTS CLÉS
  <div className="h-full flex flex-col justify-center max-w-4xl 2xl:max-w-6xl">
    <h3 className={`text-xl md:text-2xl lg:text-4xl xl:text-5xl 2xl:text-6xl font-normal mb-6 md:mb-10 ${s.text}`}>Une Approche Structurée</h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 xl:gap-12">
       <div className="space-y-6 xl:space-y-10">
          <div className="flex items-start gap-4 xl:gap-6">
              <div className={`w-10 h-10 md:w-12 md:h-12 xl:w-16 xl:h-16 rounded-full flex items-center justify-center font-normal shrink-0 ${s.accentBg} text-base xl:text-xl`}>01</div>
              <div>
                  <h4 className={`font-normal text-base md:text-lg xl:text-2xl ${s.text}`}>Maintenance proactive</h4>
                  <p className={`font-light text-sm md:text-base xl:text-lg ${s.subtext}`}>Nous assurons la surveillance, les mises à jour et les ajustements nécessaires pour prévenir les problèmes avant qu’ils n’impactent vos opérations.</p>
              </div>
          </div>
          <div className="flex items-start gap-4 xl:gap-6">
              <div className={`w-10 h-10 md:w-12 md:h-12 xl:w-16 xl:h-16 rounded-full flex items-center justify-center font-normal shrink-0 ${s.accentBg} text-base xl:text-xl`}>02</div>
              <div>
                  <h4 className={`font-normal text-base md:text-lg xl:text-2xl ${s.text}`}>Adaptation continue</h4>
                  <p className={`font-light text-sm md:text-base xl:text-lg ${s.subtext}`}>Vos outils évoluent avec votre entreprise. Nous optimisons et ajustons les fonctionnalités selon vos nouveaux besoins et vos réalités terrain.</p>
              </div>
          </div>
       </div>
       <div className={`p-6 xl:p-8 rounded-2xl ${s.card} flex flex-col justify-center`}>
          <h4 className={`font-normal mb-4 text-base md:text-lg xl:text-2xl ${s.text}`}>Support technique fiable</h4>
          <p className={`font-light text-sm md:text-base xl:text-lg leading-relaxed ${s.subtext}`}>
              Nos équipes interviennent rapidement pour corriger, stabiliser ou améliorer vos logiciels, qu’ils aient été développés par GNA ou par des tiers.
          </p>
       </div>
    </div>
  </div>,

  // SECTION 3: CONCLUSION
  <div className="h-full flex flex-col justify-center items-center text-center max-w-4xl mx-auto">
      <h3 className={`text-xl md:text-2xl lg:text-4xl xl:text-5xl font-normal mb-8 md:mb-12 ${s.text}`}>Impact Durable</h3>
      <div className={`p-8 md:p-12 rounded-3xl ${s.cardAlt} relative overflow-hidden`}>
         <span className="absolute top-4 left-6 text-6xl md:text-8xl opacity-10 font-serif">"</span>
         <p className={`text-lg md:text-2xl xl:text-3xl font-light leading-relaxed relative z-10 ${s.text}`}>
           Assurer la maintenance de vos logiciels, c’est protéger vos opérations, prolonger la durée de vie de vos outils et garantir une performance constante dans le temps.
         </p>
      </div>
  </div>
];

const FinanceSections = (s: StyleConfig) => [
  // SECTION 1: INTRO
  <div className="h-full flex flex-col justify-center max-w-4xl 2xl:max-w-6xl">
    <h3 className={`text-2xl md:text-3xl lg:text-5xl xl:text-6xl 2xl:text-7xl font-normal mb-4 md:mb-6 2xl:mb-10 ${s.text}`}>Support Financier & Subventions</h3>
    <p className={`text-base md:text-xl lg:text-2xl 2xl:text-3xl leading-relaxed font-light ${s.subtext}`}>
      Bien que Groupe Nolet & Andrews n’offre pas de financement direct, nous accompagnons les entreprises dans l’analyse financière complète de leurs projets afin d’identifier les programmes de financement et de subventions disponibles au Québec et au Canada.
    </p>
    <div className="mt-8 md:mt-12 flex gap-4">
        <div className={`px-4 py-2 md:px-6 md:py-3 rounded-lg font-normal text-sm md:text-base xl:text-lg 2xl:text-xl ${s.card}`}>Analyse</div>
        <div className={`px-4 py-2 md:px-6 md:py-3 rounded-lg font-normal text-sm md:text-base xl:text-lg 2xl:text-xl ${s.card}`}>Accompagnement</div>
    </div>
  </div>,

  // SECTION 2: POINTS CLÉS
  <div className="h-full flex flex-col justify-center max-w-4xl 2xl:max-w-6xl">
    <h3 className={`text-xl md:text-2xl lg:text-4xl xl:text-5xl 2xl:text-6xl font-normal mb-6 md:mb-10 ${s.text}`}>Une Approche Éclairée</h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 xl:gap-12">
       <div className="space-y-6 xl:space-y-10">
          <div className="flex items-start gap-4 xl:gap-6">
              <div className={`w-10 h-10 md:w-12 md:h-12 xl:w-16 xl:h-16 rounded-full flex items-center justify-center font-normal shrink-0 ${s.accentBg} text-base xl:text-xl`}>01</div>
              <div>
                  <h4 className={`font-normal text-base md:text-lg xl:text-2xl ${s.text}`}>Analyse de projet</h4>
                  <p className={`font-light text-sm md:text-base xl:text-lg ${s.subtext}`}>Nous évaluons la structure de votre entreprise, la viabilité de votre projet et son alignement avec les critères des programmes existants.</p>
              </div>
          </div>
          <div className="flex items-start gap-4 xl:gap-6">
              <div className={`w-10 h-10 md:w-12 md:h-12 xl:w-16 xl:h-16 rounded-full flex items-center justify-center font-normal shrink-0 ${s.accentBg} text-base xl:text-xl`}>02</div>
              <div>
                  <h4 className={`font-normal text-base md:text-lg xl:text-2xl ${s.text}`}>Éligibilité & stratégie</h4>
                  <p className={`font-light text-sm md:text-base xl:text-lg ${s.subtext}`}>Nous identifions les subventions, crédits ou programmes pertinents et bâtissons une stratégie réaliste pour maximiser vos chances d’acceptation.</p>
              </div>
          </div>
       </div>
       <div className={`p-6 xl:p-8 rounded-2xl ${s.card} flex flex-col justify-center`}>
          <h4 className={`font-normal mb-4 text-base md:text-lg xl:text-2xl ${s.text}`}>Gestion des démarches</h4>
          <p className={`font-light text-sm md:text-base xl:text-lg leading-relaxed ${s.subtext}`}>
              Nous pouvons prendre en charge la préparation, la complétion et la transmission des demandes et formulaires requis, afin de vous faire gagner du temps et réduire les risques d’erreurs.
          </p>
       </div>
    </div>
  </div>,

  // SECTION 3: CONCLUSION
  <div className="h-full flex flex-col justify-center items-center text-center max-w-4xl mx-auto">
      <h3 className={`text-xl md:text-2xl lg:text-4xl xl:text-5xl font-normal mb-8 md:mb-12 ${s.text}`}>Impact Durable</h3>
      <div className={`p-8 md:p-12 rounded-3xl ${s.cardAlt} relative overflow-hidden`}>
         <span className="absolute top-4 left-6 text-6xl md:text-8xl opacity-10 font-serif">"</span>
         <p className={`text-lg md:text-2xl xl:text-3xl font-light leading-relaxed relative z-10 ${s.text}`}>
           Un bon accompagnement financier, c’est transformer un projet solide en opportunité concrète, tout en naviguant efficacement dans les programmes disponibles.
         </p>
      </div>
  </div>
];

const WhyUsSections = (s: StyleConfig) => [
  // SECTION 1: INTRO
  <div className="h-full flex flex-col justify-center max-w-4xl 2xl:max-w-6xl">
    <h3 className={`text-2xl md:text-3xl lg:text-5xl xl:text-6xl 2xl:text-7xl font-normal mb-4 md:mb-6 2xl:mb-10 ${s.text}`}>Partenaire de Confiance</h3>
    <p className={`text-base md:text-xl lg:text-2xl 2xl:text-3xl leading-relaxed font-light ${s.subtext}`}>
      Et si vos opérations étaient aussi agiles que votre vision d'affaires ?
      <br/><br/>
      Avec plus de 30 ans d’expérience en stratégie numérique, gestion et technologies, nous offrons une vision intégrée qui couvre l’ensemble du spectre des entreprises : optimisation, transformation et consultance stratégique.
    </p>
    <div className="mt-8 md:mt-12 flex gap-4">
        <div className={`px-4 py-2 md:px-6 md:py-3 rounded-lg font-normal text-sm md:text-base xl:text-lg 2xl:text-xl ${s.card}`}>Expertise 30+ ans</div>
        <div className={`px-4 py-2 md:px-6 md:py-3 rounded-lg font-normal text-sm md:text-base xl:text-lg 2xl:text-xl ${s.card}`}>Vision 360°</div>
    </div>
  </div>,

  // SECTION 2: POINTS CLÉS
  <div className="h-full flex flex-col justify-center max-w-6xl 2xl:max-w-7xl">
    <h3 className={`text-xl md:text-2xl lg:text-4xl xl:text-5xl 2xl:text-6xl font-normal mb-6 md:mb-10 ${s.text}`}>Nos Engagements</h3>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 xl:gap-8">
       {[
           { t: "Approche sur mesure", d: "Chaque solution est adaptée à vos objectifs, vos ressources et votre réalité d’affaires." },
           { t: "Résultats concrets", d: "Nos recommandations sont toujours orientées vers des gains mesurables et durables." },
           { t: "Innovation continue", d: "Nous intégrons les meilleures pratiques et technologies pour garder vos solutions à jour." },
           { t: "Accompagnement humain", d: "Un partenariat basé sur la transparence, la confiance et une communication claire." },
           { t: "Sécurité et conformité", d: "Vos données et vos outils sont protégés selon les normes les plus strictes (Loi 25, RGPD)." },
           { t: "Soutien durable", d: "Nous restons présents après la mise en place pour assurer suivi, évolution et pérennité." }
       ].map((p, i) => (
           <div key={i} className={`p-5 xl:p-6 rounded-2xl ${s.card} flex flex-col`}>
              <h4 className={`font-normal text-base md:text-lg xl:text-xl mb-2 ${s.text}`}>{p.t}</h4>
              <p className={`font-light text-xs md:text-sm leading-relaxed ${s.subtext}`}>{p.d}</p>
           </div>
       ))}
    </div>
  </div>,

  // SECTION 3: CONCLUSION
  <div className="h-full flex flex-col justify-center items-center text-center max-w-4xl mx-auto">
      <h3 className={`text-xl md:text-2xl lg:text-4xl xl:text-5xl font-normal mb-8 md:mb-12 ${s.text}`}>Excellence & Agilité</h3>
      <div className={`p-8 md:p-12 rounded-3xl ${s.cardAlt} relative overflow-hidden`}>
         <span className="absolute top-4 left-6 text-6xl md:text-8xl opacity-10 font-serif">"</span>
         <p className={`text-lg md:text-2xl xl:text-3xl font-light leading-relaxed relative z-10 ${s.text}`}>
           Nous ne sommes pas seulement des consultants ou des développeurs. Nous sommes les architectes de votre croissance, alliant technologie et stratégie pour des résultats durables.
         </p>
      </div>
  </div>
];

const TeamSections = (s: StyleConfig) => {
    // Leadership Team
    const leadership = [
      { name: "Édouard Nolet", role: "Co-fondateur, PDG", img: "https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=800&auto=format&fit=crop" },
      { name: "Philippe Andrews", role: "Co-fondateur, Direction Générale", img: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=800&auto=format&fit=crop" },
    ];
    
    // Expert Team
    const experts = [
        { name: "Jean-Chérif Ayanou", role: "Directeur technique, Lead developpeur", img: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=800&auto=format&fit=crop" },
        { name: "Étienne Arsenault", role: "Lead dev sécurité, expert UI/UX", img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=800&auto=format&fit=crop" },
        { name: "Karine Boucher", role: "Consultante et experte gestion", img: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=800&auto=format&fit=crop" },
    ];

    return [
    // SECTION 1: INTRO
    <div className="h-full flex flex-col justify-center max-w-4xl 2xl:max-w-6xl">
        <h3 className={`text-2xl md:text-3xl lg:text-5xl xl:text-6xl 2xl:text-7xl font-normal mb-4 md:mb-6 2xl:mb-10 ${s.text}`}>Notre Équipe</h3>
        <p className={`text-base md:text-xl lg:text-2xl 2xl:text-3xl leading-relaxed font-light ${s.subtext}`}>
        Les experts passionnés qui propulsent votre succès.
        <br/><br/>
        Derrière chaque solution innovante se cache une équipe dévouée. Découvrez les visages de ceux qui transforment vos ambitions en réalité.
        </p>
        <div className="mt-8 md:mt-12 flex gap-4">
            <div className={`px-4 py-2 md:px-6 md:py-3 rounded-lg font-normal text-sm md:text-base xl:text-lg 2xl:text-xl ${s.card}`}>Passion</div>
            <div className={`px-4 py-2 md:px-6 md:py-3 rounded-lg font-normal text-sm md:text-base xl:text-lg 2xl:text-xl ${s.card}`}>Expertise</div>
        </div>
    </div>,

    // SECTION 2: LEADERSHIP (Alternating - Compact)
    <div className="h-full flex flex-col justify-center max-w-5xl 2xl:max-w-6xl">
        <h3 className={`text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-normal mb-6 md:mb-8 ${s.text}`}>Direction</h3>
        <div className="flex flex-col gap-6 md:gap-8">
            {leadership.map((member, idx) => (
                <div key={idx} className={`flex flex-col md:flex-row items-center gap-6 md:gap-8 ${idx % 2 === 1 ? 'md:flex-row-reverse' : ''}`}>
                    {/* Smaller Image */}
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

    // SECTION 3: EXPERTS (Alternating)
    <div className="h-full flex flex-col justify-center max-w-6xl 2xl:max-w-7xl">
        <h3 className={`text-xl md:text-2xl lg:text-4xl xl:text-5xl font-normal mb-8 md:mb-12 ${s.text}`}>Experts Techniques</h3>
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

    // SECTION 4: PORTFOLIO
    <div className="h-full flex flex-col justify-center max-w-6xl 2xl:max-w-7xl">
        <h3 className={`text-xl md:text-2xl lg:text-4xl xl:text-5xl font-normal mb-8 md:mb-12 ${s.text}`}>Portfolio Récent</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 xl:gap-8">
             {/* Project 1 */}
             <div className={`group relative rounded-2xl overflow-hidden aspect-video ${s.card} cursor-pointer`}>
                 <img src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2000&auto=format&fit=crop" className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-opacity duration-500 grayscale group-hover:grayscale-0" />
                 <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                 <div className="absolute bottom-0 left-0 w-full p-6 md:p-8 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                     <p className="text-xs uppercase tracking-widest text-white/70 mb-2">Finance & Tech</p>
                     <h4 className="text-xl md:text-2xl text-white font-normal flex items-center gap-3">
                         Plateforme Fintech 
                         <ArrowRight className="w-5 h-5 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all duration-300" />
                     </h4>
                 </div>
             </div>
             {/* Project 2 */}
             <div className={`group relative rounded-2xl overflow-hidden aspect-video ${s.card} cursor-pointer`}>
                 <img src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2000&auto=format&fit=crop" className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-opacity duration-500 grayscale group-hover:grayscale-0" />
                 <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                 <div className="absolute bottom-0 left-0 w-full p-6 md:p-8 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                     <p className="text-xs uppercase tracking-widest text-white/70 mb-2">Immobilier</p>
                     <h4 className="text-xl md:text-2xl text-white font-normal flex items-center gap-3">
                         Gestion Immobilière 360
                         <ArrowRight className="w-5 h-5 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all duration-300" />
                     </h4>
                 </div>
             </div>
        </div>
    </div>
    ];
};

const ContactSections = (s: StyleConfig) => [
  // SECTION 1: Intro & Coordonnées
  <div className="h-full flex flex-col justify-center max-w-4xl 2xl:max-w-6xl">
      <h3 className={`text-2xl md:text-3xl lg:text-5xl xl:text-6xl 2xl:text-7xl font-normal mb-4 md:mb-6 2xl:mb-10 ${s.text}`}>Contactez-Nous</h3>
      <p className={`text-base md:text-xl lg:text-2xl 2xl:text-3xl leading-relaxed font-light mb-8 md:mb-12 ${s.subtext}`}>
        Prêt à démarrer un projet ou simplement envie de discuter ? Nous sommes là pour vous.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <a href="mailto:info@noletandrews.ca" className={`p-6 rounded-2xl ${s.card} group transition-all hover:bg-white/20 flex flex-col gap-4`}>
           <div className={`w-12 h-12 rounded-full ${s.accentBg} flex items-center justify-center`}>
              <Mail className="w-6 h-6" />
           </div>
           <div>
              <p className={`text-xs uppercase tracking-widest opacity-70 mb-1`}>Email</p>
              <p className={`text-lg md:text-xl font-medium`}>info@noletandrews.ca</p>
           </div>
        </a>
        <a href="tel:+15819868494" className={`p-6 rounded-2xl ${s.card} group transition-all hover:bg-white/20 flex flex-col gap-4`}>
           <div className={`w-12 h-12 rounded-full ${s.accentBg} flex items-center justify-center`}>
              <Phone className="w-6 h-6" />
           </div>
           <div>
              <p className={`text-xs uppercase tracking-widest opacity-70 mb-1`}>Téléphone</p>
              <p className={`text-lg md:text-xl font-medium`}>+1 (581) 986-8494</p>
           </div>
        </a>
      </div>
  </div>,

  // SECTION 2: Formulaire
  <div className="h-full flex flex-col justify-center max-w-4xl mx-auto w-full">
      <h3 className={`text-xl md:text-2xl lg:text-4xl xl:text-5xl font-normal mb-8 md:mb-10 text-center ${s.text}`}>Envoyez-nous un message</h3>
      <form className="w-full grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
             <label className={`text-xs uppercase tracking-widest opacity-90 ml-1 font-semibold`}>Prénom</label>
             <input type="text" placeholder="Votre prénom" className={`w-full p-4 rounded-xl bg-white/20 border border-white/30 focus:border-white/80 outline-none transition-colors placeholder:text-white/70 text-white`} />
          </div>
          <div className="space-y-2">
             <label className={`text-xs uppercase tracking-widest opacity-90 ml-1 font-semibold`}>Nom de famille</label>
             <input type="text" placeholder="Votre nom de famille" className={`w-full p-4 rounded-xl bg-white/20 border border-white/30 focus:border-white/80 outline-none transition-colors placeholder:text-white/70 text-white`} />
          </div>
          <div className="space-y-2">
             <label className={`text-xs uppercase tracking-widest opacity-90 ml-1 font-semibold`}>Téléphone</label>
             <input type="tel" placeholder="Votre numéro de téléphone" className={`w-full p-4 rounded-xl bg-white/20 border border-white/30 focus:border-white/80 outline-none transition-colors placeholder:text-white/70 text-white`} />
          </div>
          <div className="space-y-2">
             <label className={`text-xs uppercase tracking-widest opacity-90 ml-1 font-semibold`}>Email</label>
             <input type="email" placeholder="Votre email" className={`w-full p-4 rounded-xl bg-white/20 border border-white/30 focus:border-white/80 outline-none transition-colors placeholder:text-white/70 text-white`} />
          </div>
          <div className="space-y-2 md:col-span-2">
             <label className={`text-xs uppercase tracking-widest opacity-90 ml-1 font-semibold`}>Message</label>
             <textarea rows={4} placeholder="Parlez-nous de votre projet..." className={`w-full p-4 rounded-xl bg-white/20 border border-white/30 focus:border-white/80 outline-none transition-colors resize-none placeholder:text-white/70 text-white`} />
          </div>
          <div className="md:col-span-2 mt-4 flex justify-center">
             <button type="button" className={`px-10 py-4 rounded-full bg-white text-slate-900 font-bold flex items-center gap-2 hover:scale-105 transition-transform shadow-lg`}>
                <span>Envoyer le message</span>
                <Send className="w-4 h-4" />
             </button>
          </div>
      </form>
  </div>,

  // SECTION 3: Chat / Alternative
  <div className="h-full flex flex-col justify-center items-center text-center max-w-4xl mx-auto">
      <div className={`w-20 h-20 mb-8 rounded-full ${s.accentBg} flex items-center justify-center`}>
         <MessageSquare className="w-10 h-10" />
      </div>
      <h3 className={`text-xl md:text-2xl lg:text-4xl xl:text-5xl font-normal mb-6 ${s.text}`}>Besoin d'une réponse rapide ?</h3>
      <p className={`text-lg md:text-xl font-light opacity-80 mb-10 max-w-xl`}>
        Utilisez notre chat interactif pour discuter directement avec un membre de notre équipe disponible.
      </p>
      <button className={`px-8 py-4 rounded-full ${s.card} border-2 border-white/20 hover:bg-white/10 transition-colors flex items-center gap-3`}>
         <span className="font-medium">Démarrer le Chat</span>
         <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
      </button>
  </div>
];

const GenericSections = (item: GridItem, s: StyleConfig) => [
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
      sections = DevSolutionsSections(styles);
  } else if (item.id === 'optimisation') {
      sections = OptimisationSections(styles);
  } else if (item.id === 'automatisation') {
      sections = AutomatisationSections(styles);
  } else if (item.id === 'conseil') {
      sections = ConseilSections(styles);
  } else if (item.id === 'data-analysis') {
      sections = DataAnalysisSections(styles);
  } else if (item.id === 'formation') {
      sections = FormationSections(styles);
  } else if (item.id === 'maintenance') {
      sections = MaintenanceSections(styles);
  } else if (item.id === 'finance') {
      sections = FinanceSections(styles);
  } else if (item.id === 'why-us') {
      sections = WhyUsSections(styles);
  } else if (item.id === 'team') {
      sections = TeamSections(styles);
  } else if (item.id === 'contact') {
      sections = ContactSections(styles);
  } else {
      sections = GenericSections(item, styles);
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