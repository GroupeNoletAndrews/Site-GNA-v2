import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import { GRID_ITEMS } from '../constants';
import Tile from '../components/UI/Tile';
import VisionBar from '../components/Layout/VisionBar';
import CentralPage from '../components/Content/CentralPage';
import TileContent from '../components/Content/TileContent';
import LanguageSwitcher from '../components/UI/LanguageSwitcher';
import { useI18n } from '../contexts/I18nContext';
import { ChevronDown, ChevronUp } from 'lucide-react';

const LandingPage: React.FC = () => {
  const { t } = useI18n();
  
  // --- DESKTOP STATE ---
  const [activeId, setActiveId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [isPortrait, setIsPortrait] = useState(false); // NEW: Portrait detection
  
  // PORTRAIT SPECIFIC STATE
  const [portraitActiveId, setPortraitActiveId] = useState<string>('dev-solutions');

  // NEW: Intro Mode States & Cinematic Sequence
  const [isIntroMode, setIsIntroMode] = useState(true);
  // Stages: 'idle' -> 'logo-out' -> 'overlay-in' -> 'reveal' -> 'finished'
  // Return Stages: 'return-overlay-in' -> 'return-reveal'
  const [introStage, setIntroStage] = useState<'idle' | 'logo-out' | 'overlay-in' | 'reveal' | 'finished' | 'return-overlay-in' | 'return-reveal'>('idle');
  const [introAnimationFinished, setIntroAnimationFinished] = useState(false); 

  // --- MOBILE STATE ---
  const [mobileExpandedId, setMobileExpandedId] = useState<string | null>(null);
  const [mobileSection, setMobileSection] = useState<0 | 1>(0); // 0 = Hero, 1 = List
  const [showMobileFooter, setShowMobileFooter] = useState(false); // New state for dynamic footer
  
  const mobileListRef = useRef<HTMLDivElement>(null);
  const tileRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const touchStartY = useRef<number>(0);
  const startScrollTop = useRef<number>(0); 

  // --- LAYOUT DETECTION ---
  useEffect(() => {
    const checkOrientation = () => {
      if (window.innerWidth >= 768) {
         setIsPortrait(window.innerHeight > window.innerWidth);
      } else {
         setIsPortrait(false);
      }
    };
    
    checkOrientation();
    window.addEventListener('resize', checkOrientation);
    return () => window.removeEventListener('resize', checkOrientation);
  }, []);

  // --- MOBILE LOGIC ---
  const heroItem = GRID_ITEMS.find(i => i.id === 'hero');
  const contactItem = GRID_ITEMS.find(i => i.id === 'contact');
  const rawMobileItems = GRID_ITEMS.filter(item => item.id !== 'hero' && item.id !== 'nav' && item.id !== 'contact');
  const teamItem = rawMobileItems.find(i => i.id === 'team');
  const otherItems = rawMobileItems.filter(i => i.id !== 'team');
  const mobileListItems = [...otherItems, ...(teamItem ? [teamItem] : [])];

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
    if (mobileListRef.current) {
        startScrollTop.current = mobileListRef.current.scrollTop;
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const touchEndY = e.changedTouches[0].clientY;
    const diff = touchStartY.current - touchEndY;
    const threshold = 80; 

    if (mobileSection === 0) {
      if (diff > threshold) setMobileSection(1);
    } else {
      const isAtTop = mobileListRef.current?.scrollTop === 0;
      const startedAtTop = startScrollTop.current === 0;
      if (diff < -threshold && isAtTop && startedAtTop) setMobileSection(0);
    }
  };

  const handleListScroll = () => {
    if (!mobileListRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = mobileListRef.current;
    const isAtBottom = scrollHeight - scrollTop - clientHeight <= 20;
    setShowMobileFooter(isAtBottom);
  };

  const handleTileClick = (id: string) => {
    const isOpening = mobileExpandedId !== id;
    setMobileExpandedId(isOpening ? id : null);
    if (isOpening) {
        setTimeout(() => {
            const element = tileRefs.current.get(id);
            if (element && mobileListRef.current) {
                const top = element.offsetTop;
                mobileListRef.current.scrollTo({ top: top, behavior: 'smooth' });
            }
        }, 100);
    }
  };

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (window.innerWidth >= 768) return; 
      if (isPortrait) return; 

      if (mobileSection === 0) {
        if (e.deltaY > 0) setMobileSection(1);
      } else {
        if (mobileListRef.current?.scrollTop === 0 && e.deltaY < -20) {
             setMobileSection(0);
        }
      }
    };
    window.addEventListener('wheel', handleWheel, { passive: false });
    return () => window.removeEventListener('wheel', handleWheel);
  }, [mobileSection, isPortrait]);

  // --- DESKTOP HANDLERS ---

  const handleDesktopActivate = (id: string) => {
    if (isPortrait) {
        setPortraitActiveId(id);
        return;
    }

    // --- CINEMATIC INTRO SEQUENCE ---
    if (isIntroMode) {
      if (introStage !== 'idle') return; // Prevent double trigger during animation

      // STEP 1: Fade out Logo & Text on Hero Tile
      setIntroStage('logo-out');
      
      // STEP 2: Fade In Grey/Blue Overlay (After Logo Fades)
      // INCREASED TIMEOUT: To allow for the sequential fade out of Button -> Text -> Logo
      setTimeout(() => {
        setIntroStage('overlay-in');
      }, 1100); 
      
      // STEP 3: Switch Underlying Grid Layout & Start Reveal
      setTimeout(() => {
        setIsIntroMode(false); // Snap grid to closed positions (hidden by overlay)
        setIntroStage('reveal'); // Trigger overlay fade out
      }, 3500); // Allow time for reading text

      // STEP 4: Finish
      setTimeout(() => {
        setIntroStage('finished');
        setIntroAnimationFinished(true);
        if (id !== 'hero') setActiveId(id);
      }, 4500); // +1000ms for overlay fade out

      return;
    }
    setActiveId(id);
  };

  const handleDesktopClose = () => {
    if (isIntroMode) {
      handleDesktopActivate('hero');
    } else {
      setActiveId(null);
    }
  };

  // REVISED: Cinematic Return to Intro
  const handleBackToIntro = () => {
    // 1. Trigger Overlay Fade In
    setIntroStage('return-overlay-in');

    // 2. Wait for Overlay to be mostly opaque
    setTimeout(() => {
        setActiveId(null);
        setIsIntroMode(true);
        setIntroAnimationFinished(false); // Reset animation state for "Bienvenue"
        
        // 3. Trigger Reveal (Overlay Fades Out, showing Intro Layout)
        setIntroStage('return-reveal');
    }, 600);

    // 4. Reset to Idle once reveal is done
    setTimeout(() => {
        setIntroStage('idle');
    }, 1400); // 600 + 800ms
  };

  // Helper to determine if we are "Exiting" the intro (going to dashboard)
  // This prevents the logo/text from reappearing during the transition out.
  // We ONLY want this true during the initial 'logo-out' and 'overlay-in' phases of the entry sequence.
  const isIntroExiting = introStage === 'logo-out' || (introStage === 'overlay-in' && isIntroMode);

  return (
    <div className="h-full w-full bg-[#E2E8F0] text-slate-900 selection:bg-indigo-500 selection:text-white relative overflow-hidden">
      
      {/* =========================================================================
          MOBILE LAYOUT
      ========================================================================= */}
      <div 
        className="block md:hidden w-full h-[100dvh] overflow-hidden relative bg-white"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <motion.div
            className="w-full h-[200dvh] flex flex-col will-change-transform transform-gpu"
            animate={{ y: mobileSection === 0 ? '0%' : '-50%' }}
            transition={{ type: "tween", ease: [0.33, 1, 0.68, 1], duration: 0.6 }} 
        >
            <section className="h-[100dvh] w-full relative overflow-hidden bg-[#0D4715] flex-shrink-0">
                {heroItem?.imageUrl && (
                    <>
                        <div className="absolute inset-0 w-full h-full overflow-hidden">
                            <motion.img 
                                src={heroItem.imageUrl} 
                                className="w-full h-full object-cover opacity-90"
                                style={{ objectPosition: '22% center' }}
                                initial={{ scale: 1.15, x: 0 }}
                                animate={mobileSection === 0 ? { 
                                    scale: [1.15, 1.25, 1.15], 
                                    x: [0, -12, 0], 
                                } : { scale: 1.15, x: 0 }}
                                transition={{ 
                                    scale: { duration: 20, repeat: Infinity, ease: "easeInOut" },
                                    x: { duration: 25, repeat: Infinity, ease: "easeInOut" }
                                }}
                            />
                        </div>
                        <div className="absolute inset-0 backdrop-blur-sm bg-slate-900/30" />
                    </>
                )}
                <div className="absolute inset-0 z-10 flex flex-col justify-between p-6 pb-20 xs:pb-24 sm:p-10">
                    <div />
                    <div className="flex flex-col items-center text-center gap-4">
                        <img src="https://plexview.ca/assets/Nolet__andrews_blanc-CHc9YYqz.png" alt="Logo" className="w-4/5 max-w-[200px] xs:max-w-[240px] sm:max-w-[300px] object-contain drop-shadow-sm opacity-95 mb-4" />
                        <div className="h-px w-20 bg-white/40 mb-2" />
                        <p className="text-white text-sm xs:text-base sm:text-lg font-light leading-snug max-w-xs sm:max-w-md drop-shadow-md">{heroItem?.description}</p>
                    </div>
                    <div className="flex flex-col items-center gap-2 text-white/60 animate-bounce cursor-pointer" onClick={() => setMobileSection(1)}>
                        <span className="text-[10px] xs:text-xs uppercase tracking-widest">{t('landing.mobile.decouvrir')}</span>
                        <ChevronDown className="w-5 h-5" />
                    </div>
                </div>
            </section>

            <div className="h-[100dvh] w-full flex flex-col bg-slate-100 relative flex-shrink-0">
                <div className="flex-shrink-0 relative w-full px-5 py-3 flex items-center justify-between z-50 shadow-md overflow-hidden h-16 sm:h-20 bg-slate-900/10 backdrop-blur-md">
                    <div className="absolute inset-0 z-0">
                         {heroItem?.imageUrl && (
                            <>
                                <motion.img 
                                    src={heroItem.imageUrl} 
                                    className="w-full h-full object-cover opacity-40 mix-blend-overlay"
                                    style={{ objectPosition: '22% center' }}
                                    animate={mobileSection === 1 ? { scale: [1.15, 1.25, 1.15], x: [0, -12, 0] } : { scale: 1.15, x: 0 }}
                                    transition={{ scale: { duration: 20, repeat: Infinity, ease: "easeInOut" }, x: { duration: 25, repeat: Infinity, ease: "easeInOut" } }}
                                />
                                <div className="absolute inset-0 bg-slate-900/60" />
                            </>
                        )}
                    </div>
                    <div className="relative z-10 w-full flex items-center justify-between">
                        <div className="h-8 xs:h-10 sm:h-12 flex items-center justify-center cursor-pointer relative z-20" onClick={() => setMobileSection(0)}>
                            <img src="https://plexview.ca/assets/Nolet__andrews_blanc-CHc9YYqz.png" alt="Logo" className="h-full w-auto object-contain opacity-100 drop-shadow-md" />
                        </div>
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                            <span className="text-xs xs:text-sm sm:text-base font-normal tracking-wide text-white uppercase drop-shadow-sm">{t('landing.mobile.servicesOfferts')}</span>
                        </div>
                        {/* Mobile Menu Button REMOVED */}
                    </div>
                </div>

                <div ref={mobileListRef} className="flex-grow overflow-y-auto no-scrollbar relative" onScroll={handleListScroll}>
                    <div className="flex flex-col w-full bg-slate-100 pb-40">
                      <LayoutGroup>
                        {mobileListItems.map((item) => {
                            const isExpanded = mobileExpandedId === item.id;
                            const textColor = item.textClass.includes('white') ? 'text-white' : 'text-slate-900';
                            return (
                                <motion.div layout key={item.id} ref={(el) => { if (el) tileRefs.current.set(item.id, el); else tileRefs.current.delete(item.id); }} className="w-full flex flex-col relative z-0" initial={{ opacity: 1 }}>
                                    <motion.button layout="position" onClick={() => handleTileClick(item.id)} className={`w-full relative overflow-hidden text-left transition-all duration-300 ${isExpanded ? 'min-h-[140px]' : 'min-h-[100px] sm:min-h-[120px]'}`}>
                                        <div className={`absolute inset-0 ${item.bgClass}`} />
                                        {item.imageUrl && ( <div className="absolute inset-0 opacity-20 mix-blend-overlay"><img src={item.imageUrl} className="w-full h-full object-cover grayscale" /></div> )}
                                        <div className={`absolute inset-0 border-b ${textColor === 'text-white' ? 'border-white/10' : 'border-black/5'}`} />
                                        <div className={`relative z-10 w-full h-full p-6 sm:p-8 flex flex-row items-center justify-between ${item.textClass}`}>
                                            <div className="flex flex-col items-start gap-1 max-w-[85%]">
                                                <div className="flex items-center gap-3 mb-1">
                                                    {item.icon && <item.icon className="w-5 h-5 sm:w-6 sm:h-6 opacity-90" />}
                                                    <h3 className="text-lg sm:text-xl font-medium leading-tight">{item.title}</h3>
                                                </div>
                                                <p className="text-xs sm:text-sm uppercase tracking-widest opacity-70 pl-8">{item.subtitle || item.description}</p>
                                            </div>
                                            <div className="shrink-0 opacity-70">
                                                {isExpanded ? <ChevronUp className="w-5 h-5 sm:w-6 sm:h-6" /> : <ChevronDown className="w-5 h-5 sm:w-6 sm:h-6" />}
                                            </div>
                                        </div>
                                    </motion.button>
                                    <AnimatePresence mode="sync">
                                        {isExpanded && (
                                            <motion.div layout="position" key="content" initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.75, ease: [0.04, 0.62, 0.23, 0.98] }} className="overflow-hidden bg-white">
                                                <div className="w-full"><TileContent item={item} isMobile={true} /></div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            );
                        })}
                      </LayoutGroup>
                    </div>
                </div>

                {contactItem && (() => {
                    const isContactExpanded = mobileExpandedId === 'contact';
                    const isOtherTileExpanded = mobileExpandedId !== null && !isContactExpanded;
                    const shouldShrink = isOtherTileExpanded && !showMobileFooter;
                    
                    return (
                        <motion.div 
                            className="absolute z-40 shadow-[0_-4px_20px_rgba(0,0,0,0.15)]" 
                            initial={false} 
                            animate={{ 
                                width: shouldShrink ? 60 : "100%", 
                                height: shouldShrink ? 60 : "auto", 
                                bottom: shouldShrink ? 20 : (showMobileFooter ? 44 : 0), 
                                right: shouldShrink ? 20 : 0, 
                                left: shouldShrink ? "auto" : 0, 
                                borderRadius: shouldShrink ? "50%" : 0, 
                            }} 
                            transition={{ duration: 0.5, ease: [0.2, 0.8, 0.2, 1] }}
                        >
                             <div className="w-full h-full flex flex-col relative overflow-hidden">
                                    <button 
                                        onClick={() => setMobileExpandedId(isContactExpanded ? null : 'contact')} 
                                        className={`w-full h-full relative overflow-hidden text-left transition-all duration-300 ${shouldShrink ? '' : 'min-h-[100px] sm:min-h-[120px]'}`}
                                    >
                                        <div className={`absolute inset-0 ${contactItem.bgClass}`} />
                                        {contactItem.imageUrl && ( <div className="absolute inset-0 opacity-20 mix-blend-overlay"><img src={contactItem.imageUrl} className="w-full h-full object-cover grayscale" /></div> )}
                                        <div className={`absolute top-0 left-0 w-full h-px bg-white/20 ${shouldShrink ? 'hidden' : 'block'}`} />
                                        
                                        {/* WRAPPER FOR CONTENT */}
                                        <div className={`relative z-10 w-full h-full ${contactItem.textClass}`}>
                                            
                                            {/* 1. SHRUNK STATE ICON (Absolute Center - Always rendered but hidden if not shrunk to prevent mounting glitches) */}
                                            <motion.div 
                                                className="absolute inset-0 flex items-center justify-center pointer-events-none"
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: shouldShrink ? 1 : 0 }}
                                                transition={{ duration: 0.2 }}
                                            >
                                                {contactItem.icon && <contactItem.icon className="w-8 h-8" />}
                                            </motion.div>

                                            {/* 2. EXPANDED STATE CONTENT (Fade out when shrinking) */}
                                            <motion.div 
                                                className="w-full h-full p-6 sm:p-8 flex flex-row items-center justify-between"
                                                animate={{ opacity: shouldShrink ? 0 : 1 }}
                                                transition={{ duration: 0.2 }}
                                            >
                                                <div className="flex flex-col items-start gap-1 max-w-[85%]">
                                                    <div className="flex items-center gap-3 mb-1">
                                                        {contactItem.icon && <contactItem.icon className="w-5 h-5 sm:w-6 sm:h-6 opacity-90" />}
                                                        <h3 className="text-lg sm:text-xl font-medium leading-tight">{contactItem.title}</h3>
                                                    </div>
                                                    <p className="text-xs sm:text-sm uppercase tracking-widest opacity-70 pl-8">{contactItem.subtitle || contactItem.description}</p>
                                                </div>
                                                <div className="shrink-0 opacity-70">
                                                    {isContactExpanded ? <ChevronDown className="w-5 h-5 sm:w-6 sm:h-6 rotate-180 transition-transform" /> : <ChevronUp className="w-5 h-5 sm:w-6 sm:h-6 transition-transform" />}
                                                </div>
                                            </motion.div>
                                        </div>
                                    </button>
                                    
                                    <AnimatePresence initial={false}>
                                        {isContactExpanded && !shouldShrink && (
                                            <motion.div key="contact-content" initial={{ height: 0, opacity: 0 }} animate={{ height: "60vh", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.75, ease: [0.04, 0.62, 0.23, 0.98] }} className="overflow-y-auto bg-white border-t border-slate-200 order-last">
                                                <div className="w-full"><TileContent item={contactItem} isMobile={true} /></div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                             </div>
                        </motion.div>
                    );
                })()}
                <AnimatePresence>
                  {showMobileFooter && (
                    <motion.div initial={{ y: '100%' }} animate={{ y: '0%' }} exit={{ y: '100%' }} transition={{ duration: 0.3 }} className="absolute bottom-0 left-0 w-full h-11 z-50 bg-white/95 backdrop-blur-sm border-t border-slate-100 flex items-center justify-center shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
                      <p className="text-[10px] sm:text-xs text-slate-500 font-medium uppercase tracking-widest">{t('landing.mobile.copyright')}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
            </div>
        </motion.div>
        
        {/* Mobile Menu Overlay REMOVED */}

      </div>

      {/* =========================================================================
          DESKTOP LAYOUT
      ========================================================================= */}
      
      {isPortrait ? (
        // --- PORTRAIT DASHBOARD ---
        <div className="hidden md:flex flex-col w-full h-full overflow-hidden relative bg-[#E2E8F0]">
            {heroItem && (
               <div className="w-full h-[13vh] min-h-[120px] relative z-20 shadow-xl flex-shrink-0">
                 <Tile item={heroItem} isActive={false} isAnyActive={false} isPortrait={true} onActivate={() => {}} onClose={() => {}} onBackToIntro={handleBackToIntro} hoveredId={null} setHoveredId={() => {}} />
               </div>
            )}
            <div className="w-full grid grid-cols-6 h-auto bg-white z-10 flex-shrink-0">
                {GRID_ITEMS.filter(item => item.id !== 'hero').map((item) => (
                    <Tile key={item.id} item={item} isActive={portraitActiveId === item.id} isAnyActive={true} isPortrait={true} onActivate={handleDesktopActivate} onClose={() => {}} hoveredId={hoveredId} setHoveredId={setHoveredId} />
                ))}
            </div>
            {portraitActiveId && (() => {
                const activeItem = GRID_ITEMS.find(i => i.id === portraitActiveId);
                if (!activeItem) return null;
                const isDark = activeItem.textClass.includes('text-white');
                return (
                    <motion.div key={activeItem.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} className={`flex-grow flex flex-col w-full relative overflow-y-auto no-scrollbar ${activeItem.bgClass} ${activeItem.textClass}`}>
                        <div className={`w-full px-12 py-10 border-b ${isDark ? 'border-white/10 bg-white/5' : 'border-black/5 bg-black/5'} backdrop-blur-sm sticky top-0 z-10`}>
                             <div className="flex items-center gap-4 mb-2">{activeItem.icon && <activeItem.icon className="w-8 h-8 opacity-80" />}<h2 className="text-4xl font-normal tracking-tight">{activeItem.title}</h2></div>
                             {activeItem.subtitle && (<p className="text-lg opacity-70 uppercase tracking-widest font-light ml-12">{activeItem.subtitle}</p>)}
                        </div>
                        <div className="w-full max-w-7xl mx-auto p-12"><TileContent item={activeItem} isPortraitFlow={true} /></div>
                    </motion.div>
                );
            })()}
        </div>
      ) : (
        // --- LANDSCAPE STANDARD BENTO ---
        <div className="hidden md:block w-full h-screen relative overflow-hidden bg-[#E2E8F0]">
            
            <div className="w-full h-full relative overflow-hidden">
                {/* LAYER 0 : CENTRAL PAGE */}
                <div className="absolute top-0 left-0 w-full h-full z-0">
                    <CentralPage activeId={activeId} onClose={handleDesktopClose} isPortrait={isPortrait} />
                </div>

                {/* LAYER 1 : GRID SYSTEM */}
                <div 
                className="absolute top-0 left-0 w-full h-full grid grid-cols-1 md:grid-cols-12 gap-0 pointer-events-none z-10"
                style={{ gridTemplateRows: 'repeat(5, calc((100vh - 5rem) / 6)) minmax(0, 1fr)' }}
                >
                {GRID_ITEMS.map((item) => {
                    return (
                    <Tile 
                        key={item.id} 
                        item={item} 
                        isActive={activeId === item.id}
                        isAnyActive={activeId !== null}
                        isIntroMode={isIntroMode}
                        // Intro Exiting is true only if we are LEAVING Intro (logo-out / overlay-in)
                        isIntroExiting={isIntroExiting} 
                        introAnimationFinished={introAnimationFinished} 
                        isPortrait={isPortrait} 
                        onActivate={handleDesktopActivate}
                        onClose={handleDesktopClose}
                        onBackToIntro={handleBackToIntro} 
                        hoveredId={hoveredId}
                        setHoveredId={setHoveredId}
                    />
                    );
                })}
                </div>

                {/* LAYER 2 : TRANSITION OVERLAY (Cinematic Intro & Return) */}
                <AnimatePresence>
                  {(introStage === 'overlay-in' || introStage === 'reveal' || introStage === 'return-overlay-in' || introStage === 'return-reveal') && (
                    <motion.div
                        key="intro-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.8, ease: "easeInOut" }}
                        className="absolute inset-0 z-[60] flex items-center justify-center bg-[#E1E6EC]/90 backdrop-blur-xl"
                    >
                        {/* Only show "C'est parti" Text during the ENTRY sequence, not the RETURN sequence */}
                        {(introStage === 'overlay-in' || introStage === 'reveal') && (
                            <motion.div 
                            className="max-w-4xl px-8 text-center"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ delay: 0.5, duration: 0.8 }}
                            >
                                <h2 className="text-3xl md:text-5xl font-light text-slate-800 leading-tight">
                                    {t('common.cestParti')}
                                </h2>
                                <p className="mt-6 text-lg md:text-2xl text-slate-600 font-light leading-relaxed">
                                    {t('common.naviguezTuiles')} <br/> {t('common.enApprendrePlus')}
                                </p>
                            </motion.div>
                        )}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* FOOTER */}
                <div className="absolute bottom-0 left-0 w-full z-50">
                    <AnimatePresence>
                        {!isIntroMode && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.5 }}
                            >
                                <VisionBar />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
      )}

      {/* Language Switcher - Flottant pour tous les layouts */}
      <LanguageSwitcher />

    </div>
  );
};

export default LandingPage;