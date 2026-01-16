import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GridItem } from '../../types';
import { GRID_ITEMS } from '../../constants';
import { ArrowUpRight, Menu as MenuIcon, ArrowRight, ArrowLeft, MousePointerClick, LayoutGrid, RotateCcw } from 'lucide-react';

interface TileProps {
  item: GridItem;
  isActive: boolean;
  isAnyActive: boolean;
  isIntroMode?: boolean; 
  isIntroExiting?: boolean; 
  introAnimationFinished?: boolean;
  isPortrait?: boolean; // Controls specific layout mode
  collapsedIndex?: number; 
  onActivate: (id: string) => void;
  onClose: () => void;
  onBackToIntro?: () => void;
  hoveredId: string | null;
  setHoveredId: (id: string | null) => void;
}

// --- CONSTANTS --- //
const ANIMATION_PAIRS = [
  ['dev-solutions', 'conseil'],      
  ['optimisation', 'data-analysis'], 
  ['automatisation', 'formation'],
  ['maintenance', 'finance'],
  ['contact', 'team']                
];

const DEFAULT_POSITIONS: Record<string, string> = {
  'hero': 'md:col-start-1 md:row-start-1',
  'dev-solutions': 'md:col-start-3 md:row-start-1',
  'conseil': 'md:col-start-7 md:row-start-1',
  'optimisation': 'md:col-start-3 md:row-start-2',
  'data-analysis': 'md:col-start-10 md:row-start-2',
  'automatisation': 'md:col-start-3 md:row-start-3',
  'formation': 'md:col-start-9 md:row-start-3',
  'maintenance': 'md:col-start-3 md:row-start-4',
  'finance': 'md:col-start-8 md:row-start-4',
  'why-us': 'md:col-start-3 md:row-start-5',
  'contact': 'md:col-start-3 md:row-start-6', 
  'team': 'md:col-start-9 md:row-start-6',
};

// MAPPING FOR INTRO MODE
const INTRO_POSITIONS: Record<string, string> = {
    'hero': 'md:col-start-1 md:col-span-12 md:row-start-1 md:row-span-6',
};

// --- PORTRAIT NAV CONFIG (2 Rows, 6 Cols) ---
// UPDATED: Team is order-10 (1x1), Contact is order-11 (2x1) at the end.
const PORTRAIT_NAV_CONFIG: Record<string, string> = {
  'dev-solutions':  'order-1 col-span-1 aspect-square',
  'conseil':        'order-2 col-span-1 aspect-square',
  'optimisation':   'order-3 col-span-1 aspect-square',
  'data-analysis':  'order-4 col-span-1 aspect-square',
  'automatisation': 'order-5 col-span-1 aspect-square',
  'formation':      'order-6 col-span-1 aspect-square',
  'maintenance':    'order-7 col-span-1 aspect-square',
  'finance':        'order-8 col-span-1 aspect-square',
  'why-us':         'order-9 col-span-1 aspect-square',
  'team':           'order-10 col-span-1 aspect-square', // Moved before Contact
  'contact':        'order-11 col-span-2 aspect-[2/1]', // Moved to end (Last item)
};

const LEFT_SIDE_IDS = ['dev-solutions', 'optimisation', 'automatisation', 'maintenance', 'contact'];

// --- SUB-COMPONENTS --- //

const DateDisplay = () => {
  // Format: "Jeudi 24 Octobre"
  const today = new Date().toLocaleDateString('fr-FR', { 
    weekday: 'long', 
    day: 'numeric', 
    month: 'long' 
  });
  
  // Capitalize first letter
  const formattedDate = today.charAt(0).toUpperCase() + today.slice(1);

  return (
    <div className="flex flex-col items-end">
        <span className="text-white/90 text-sm font-light tracking-wide uppercase text-right leading-none">
        {formattedDate}
        </span>
    </div>
  );
};

const Tile: React.FC<TileProps> = ({ item, isActive, isAnyActive, isIntroMode = false, isIntroExiting = false, introAnimationFinished = false, isPortrait = false, collapsedIndex, onActivate, onClose, onBackToIntro, hoveredId, setHoveredId }) => {
  const [isHovering, setIsHovering] = useState(false);
  const [isExiting, setIsExiting] = useState(false); 

  useEffect(() => {
    if (!isActive) {
      setIsExiting(false);
    }
  }, [isActive]);

  // --- EVENTS ---
  const handleMouseEnter = () => { setIsHovering(true); setHoveredId(item.id); };
  const handleMouseLeave = () => { setIsHovering(false); setHoveredId(null); };
  
  const handleClick = () => {
    // CLICK LOGIC:
    if (isPortrait) {
        if (item.id === 'hero') return; // Hero not clickable in portrait nav
        onActivate(item.id);
        return;
    }

    if (isIntroMode) {
      onActivate(item.id); 
      return;
    }

    if (item.id === 'hero') {
        if (isAnyActive) {
            onClose();
        }
        return;
    }
    
    if (isActive) {
      onClose();
    } else {
      setIsExiting(true);
      setTimeout(() => {
        onActivate(item.id);
      }, 250);
    }
  };

  // --- STATE CALCULATION ---
  const isHoverMode = hoveredId !== null && !isAnyActive && !isIntroMode;
  const isHero = item.type === 'logo';
  const isButtonMode = isAnyActive && !isHero; 
  const isLeft = LEFT_SIDE_IDS.includes(item.id);
  const isRightSide = !isLeft && !isHero; // Tiles visually on the right side (including why-us)
  
  const isContactTile = item.id === 'contact';
  const isTeamTile = item.id === 'team';
  const isBottomRowTile = isContactTile || isTeamTile;

  // --- TRANSITIONS ---
  const mainTransition = { 
    type: "spring" as const,
    stiffness: 110, 
    damping: 24,
    mass: 1,
    restDelta: 0.0005,
    restSpeed: 0.0005
  };

  // NEW: A slower, cinematic transition specifically for the Hero Tile layout AND the image slide
  // ensuring they move in perfect lockstep.
  const cinematicTransition = {
    duration: 1.2,
    ease: [0.2, 0.8, 0.2, 1] as [number, number, number, number]
  };

  // --- SCALE LOGIC ---
  const getScaleConfig = () => {
    // 1. INTRO MODE or PORTRAIT: No scaling
    if (isIntroMode || isPortrait) return { scaleX: 1, parentOriginX: 0 };

    // 2. ACTIVE MODE: No scaling tricks needed, resets to absolute 0 origin for list view
    if (isAnyActive) {
      return { scaleX: 1, parentOriginX: 0 };
    }

    // 3. CONSTANTS
    const RESTING_SCALE = 1.005; 
    const EXPANSION_FACTOR = 0.15;
    const BUFFER = 0.01; // Additional buffer during movement

    // 4. ORIGIN LOGIC
    let parentOriginX = 0.5; // Default center
    let pair: string[] | undefined;

    if (item.id === 'hero' || item.id === 'why-us') {
       // Keep default 0.5
    } else {
       pair = ANIMATION_PAIRS.find(p => p.includes(item.id));
       if (pair) {
         const [leftId] = pair;
         const isLeftTile = item.id === leftId;
         parentOriginX = isLeftTile ? 0 : 1;
       }
    }

    // 5. SCALE CALCULATION
    let scaleX = RESTING_SCALE;

    if (hoveredId && pair) {
      const [leftId, rightId] = pair;
      const isLeftTile = item.id === leftId;
      
      if (item.id === hoveredId) {
        scaleX = 1 + EXPANSION_FACTOR + BUFFER;
      } else {
        const partnerId = isLeftTile ? rightId : leftId;
        if (partnerId === hoveredId) {
           const partnerItem = GRID_ITEMS.find(i => i.id === partnerId);
           const partnerSpan = partnerItem?.colSpan || 1;
           const mySpan = item.colSpan;
           const shrinkFactor = (partnerSpan * EXPANSION_FACTOR) / mySpan;
           scaleX = 1 - shrinkFactor + BUFFER;
        }
      }
    }

    return { scaleX, parentOriginX };
  };

  const { scaleX, parentOriginX } = getScaleConfig();
  const inverseScaleX = scaleX !== 0 ? 1 / scaleX : 1;

  // --- GRID CLASSES LOGIC ---
  let gridClasses = '';
  
  if (isPortrait) {
    if (item.id === 'hero') {
         gridClasses = 'w-full h-full'; 
    } else {
        // Apply specific Portrait Nav Config to handle swapping and sizing
        // Also added 'aspect-square' and 'aspect-[2/1]' directly in config map
        const navClass = PORTRAIT_NAV_CONFIG[item.id] || 'col-span-1 aspect-square';
        gridClasses = `${navClass} w-full relative`;
    }
  } else if (isIntroMode) {
     gridClasses = INTRO_POSITIONS[item.id] || 'hidden';
     gridClasses += ' z-30 cursor-pointer'; 
  } else if (isAnyActive) {
    // --- LANDSCAPE ACTIVE GRID MAPPING ---
        if (item.id === 'hero') {
            gridClasses = 'col-span-1 md:col-start-1 md:col-span-1 md:row-start-1 md:row-span-6 z-30 cursor-pointer'; 
        } else {
            const leftIndex = LEFT_SIDE_IDS.indexOf(item.id);
            if (leftIndex !== -1) {
                const leftSideMap: Record<string, number> = {
                    'dev-solutions': 1, 'optimisation': 2, 'automatisation': 3, 'maintenance': 4, 'contact': 5 
                };
                const targetRow = leftSideMap[item.id];
                 if (targetRow) {
                    const spanClass = item.id === 'contact' ? 'md:row-span-2' : 'md:row-span-1';
                    gridClasses = `col-span-1 md:col-start-2 md:col-span-1 md:row-start-${targetRow} ${spanClass} z-30`;
                } else { gridClasses = 'hidden'; }
            } else {
                const rightSideMap: Record<string, number> = {
                    'conseil': 1, 'data-analysis': 2, 'formation': 3, 'finance': 4, 'why-us': 5, 'team': 6
                };
                const targetRow = rightSideMap[item.id];
                if (targetRow) {
                    gridClasses = `col-span-1 md:col-start-12 md:col-span-1 md:row-start-${targetRow} md:row-span-1 z-30`;
                } else { gridClasses = 'hidden'; }
            }
        }
  } else {
    // --- LANDSCAPE CLOSED GRID MAPPING ---
    const colSpanClass = { 1:'col-span-1 md:col-span-1', 2:'col-span-1 md:col-span-2', 3:'col-span-1 md:col-span-3', 4:'col-span-1 md:col-span-4', 5:'col-span-1 md:col-span-5', 6:'col-span-1 md:col-span-6', 7:'col-span-1 md:col-span-7', 8:'col-span-1 md:col-span-8', 9:'col-span-1 md:col-span-9', 10:'col-span-1 md:col-span-10', 11:'col-span-1 md:col-span-11', 12:'col-span-1 md:col-span-12' }[item.colSpan] || 'col-span-1';
    const rowSpanClass = { 1:'row-span-1', 2:'row-span-1 md:row-span-2', 3:'row-span-1 md:row-span-3', 4:'row-span-1 md:row-span-4', 5:'row-span-1 md:row-span-5', 6:'row-span-1 md:row-span-6' }[item.rowSpan] || 'row-span-1';
    const explicitPosition = DEFAULT_POSITIONS[item.id] || '';
    gridClasses = `${colSpanClass} ${rowSpanClass} ${explicitPosition}`;
  }

  const sidebarIndex = LEFT_SIDE_IDS.indexOf(item.id);
  const sidebarVariants = {
    inactive: { 
        y: 0, 
        opacity: 1, 
        scaleX: (!isAnyActive && !isIntroMode && !isPortrait) ? scaleX : 1 
    },
    active: { 
        y: 0, 
        opacity: 1,
        scaleX: 1,
        transition: {
            delay: 0.1 + ((sidebarIndex !== -1 ? sidebarIndex : 0) * 0.05),
            type: "spring" as const,
            stiffness: 80,
            damping: 20
        }
    },
    sidebarHidden: {
        y: -40,
        opacity: 0
    }
  };

  const isLeftSidebarItem = isAnyActive && LEFT_SIDE_IDS.includes(item.id);
  const isDark = item.textClass.includes('text-white');
  let borderColor = isDark ? 'border-white/10' : 'border-black/5';

  if (item.id === 'hero') {
    borderColor = 'border-white/50';
  }
  
  // Border logic
  let borderClass = `border-b border-r ${borderColor}`;
  
  if (isAnyActive && !isPortrait) {
      if (item.id === 'hero') { borderClass = `border-r ${borderColor}`; } 
      else if (isLeftSidebarItem) { borderClass = `border-b ${borderColor}`; } 
      else { borderClass = `border-b border-l ${borderColor}`; }
  } else if (isIntroMode) {
      if (item.id === 'hero') { borderClass = `border-r ${borderColor}`; }
      else { borderClass = `border-b ${borderColor}`; }
  } else if (isPortrait) {
      // Portrait borders (grid handled by parent gaps usually, but adding borders here for definition)
      borderClass = `border-r border-b ${borderColor}`;
  }

  // --- GLASSMORPHISM LOGIC FOR ACTIVE TILE ---
  const backgroundClass = item.bgClass;

  const glassOverlayClass = isDark 
    ? 'bg-white/10 backdrop-blur-md' 
    : 'bg-white/40 backdrop-blur-md';

  if (gridClasses === 'hidden') return null;

  return (
    <motion.div
      layout
      initial={isButtonMode && !isPortrait ? "sidebarHidden" : "inactive"}
      animate={isAnyActive && !isPortrait ? "active" : "inactive"}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      className={`
        ${gridClasses} relative min-h-[80px] md:min-h-0 md:h-full group pointer-events-auto
        ${isActive ? 'z-40' : (isButtonMode || isPortrait ? 'z-30' : 'z-20')}
        ${isHero ? 'shadow-2xl z-22' : 'cursor-pointer'} 
        ${isPortrait && isActive ? 'z-50' : ''} 
      `}
      style={{ zIndex: isActive ? 40 : (isAnyActive ? (isHero ? 35 : 30) : (isHero ? 30 : (isHovering ? 25 : 20))) }}
      // UPDATE: Apply cinematic transition to the Hero Tile's Layout so it matches the image slide
      transition={(isHero && !isPortrait) ? cinematicTransition : mainTransition}
    >
      <motion.div
        className="w-full h-full relative overflow-hidden"
        variants={(!isHero && !isPortrait) ? sidebarVariants : undefined}
        style={{ originX: parentOriginX }}
        transition={mainTransition}
      >
        {/* Base Background Color */}
        <div className={`absolute inset-0 ${backgroundClass} ${borderClass} transition-all duration-500`} />
        
        {/* Active Glass Overlay */}
        <AnimatePresence>
            {isActive && !isPortrait && (
                <motion.div 
                    key="glass-overlay"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className={`absolute inset-0 ${glassOverlayClass} z-0 pointer-events-none`}
                />
            )}
            {/* Portrait Active Overlay (Visible Glass Effect - NEW DESIGN) */}
            {isPortrait && isActive && (
                 <motion.div 
                    key="portrait-active"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className={`absolute inset-0 z-10 pointer-events-none bg-white/20 backdrop-blur-md border border-white/30 shadow-[inset_0_0_15px_rgba(255,255,255,0.2)]`}
                 />
            )}
        </AnimatePresence>
        
        {item.imageUrl && !isButtonMode && !isHero && !isPortrait && (
             <motion.img initial={{ opacity: 0 }} animate={{ opacity: isHovering ? 0.1 : 0 }} src={item.imageUrl} className="absolute inset-0 w-full h-full object-cover mix-blend-overlay grayscale transition-opacity duration-500" />
        )}

        {isHero && item.imageUrl && (
            <div className="absolute inset-0 w-full h-full overflow-hidden">
                <motion.div 
                    className="absolute top-0 left-0 h-full min-w-[100vw] flex"
                    initial={false}
                    animate={{ 
                        // Slide image LEFT to reveal the "underneath" (content on the right)
                        // By moving left by 55%, we position the 'Middle-Right' of the image into the left sidebar view
                        x: (isAnyActive && !isPortrait) ? "-55%" : "0%" 
                    }}
                    // UPDATE: Ensure image slide uses same cinematic transition as the parent tile layout
                    transition={cinematicTransition}
                >
                    <motion.img 
                        src={item.imageUrl} 
                        className="w-full h-full object-cover opacity-90"
                        style={{ objectPosition: 'center' }}
                        animate={{ 
                            scale: [1.15, 1.25, 1.15], 
                        }}
                        transition={{ 
                            duration: 20, repeat: Infinity, ease: "easeInOut" 
                        }}
                    />
                </motion.div>
                <div className="absolute inset-0 backdrop-blur-[5px] bg-slate-900/25 transition-all duration-500" />
            </div>
        )}
        
        <AnimatePresence>
            {isExiting && !isHero && (
                <motion.div
                    key="ripple-effect"
                    className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden z-[5]"
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.25 }}
                >
                    <motion.div 
                        className="absolute bg-white/40 rounded-full blur-2xl"
                        initial={{ width: '0%', height: '0%', opacity: 0.8 }}
                        animate={{ width: '180%', height: '180%', opacity: 0 }}
                        transition={{ duration: 0.4, ease: "easeOut" }}
                    />
                </motion.div>
            )}
        </AnimatePresence>

        <motion.div 
            className="relative z-10 w-full h-full"
            initial={{ scaleX: 1 }}
            animate={{ scaleX: (!isAnyActive && !isIntroMode && !isPortrait) ? inverseScaleX : 1 }}
            style={{ originX: 0 }} 
            transition={mainTransition} 
        >
            
            {isHero ? (
                // --- HERO RENDER ---
                <div className="w-full h-full relative z-10">
                    
                    {isPortrait ? (
                        // === PORTRAIT HERO LAYOUT ===
                        <div className="w-full h-full relative p-6">
                            {/* LOGO TOP LEFT */}
                             <div className="absolute top-6 left-8">
                                <img 
                                    src="https://plexview.ca/assets/Nolet__andrews_blanc-CHc9YYqz.png" 
                                    alt="Logo" 
                                    className="h-12 w-auto object-contain drop-shadow-md" 
                                />
                             </div>

                             {/* DATE TOP RIGHT */}
                             <div className="absolute top-8 right-8">
                                <DateDisplay />
                             </div>

                             {/* TITLE/SUBTITLE CENTERED (OPTIONAL BUT GOOD FOR BALANCE) */}
                             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center w-full px-20">
                                <h1 className="text-white text-3xl font-light tracking-tight">{item.title}</h1>
                                <p className="text-white/70 text-sm uppercase tracking-widest mt-2">{item.subtitle}</p>
                             </div>

                             {/* BACK BUTTON BOTTOM RIGHT */}
                             {onBackToIntro && (
                                 <button 
                                    onClick={(e) => { e.stopPropagation(); onBackToIntro(); }}
                                    className="absolute bottom-6 right-8 flex items-center gap-2 text-white/80 hover:text-white transition-colors bg-black/20 hover:bg-black/30 px-4 py-2 rounded-full backdrop-blur-sm"
                                 >
                                    <span className="text-xs uppercase tracking-widest">Accueil</span>
                                    <RotateCcw className="w-4 h-4" />
                                 </button>
                             )}
                        </div>
                    ) : (
                        // === LANDSCAPE HERO LAYOUT ===
                        <div className="w-full h-full flex flex-col">
                             
                             {/* MAIN CENTERED CONTENT (LOGO) */}
                             <div className={`flex-grow flex flex-col items-center w-full transition-all duration-500 ease-in-out px-4
                                ${isIntroMode 
                                    ? 'justify-center pb-20' 
                                    : (isAnyActive 
                                        ? 'justify-start pt-8 md:pt-12' 
                                        : 'justify-start pt-10 md:pt-10 xl:pt-12') // UPDATED: Reduced padding-top to move logo higher in Grid mode
                                }
                            `}>
                                <motion.div 
                                    layout="position"
                                    className="relative flex flex-col items-center justify-center shrink-0"
                                    // UPDATED ANIMATION LOGIC:
                                    // When exiting intro, fade to 0. 
                                    // Add Delay to ensure it is the LAST to fade out (Sequential Animation).
                                    animate={{ 
                                        opacity: (isIntroExiting || (!isIntroMode && !introAnimationFinished && !isAnyActive)) ? 0 : 1 
                                    }}
                                    transition={{ 
                                        duration: 0.5,
                                        // Stagger: If exiting, wait 0.5s so other elements fade first.
                                        delay: isIntroExiting ? 0.5 : 0 
                                    }}
                                >
                                    <motion.img 
                                        src="https://plexview.ca/assets/Nolet__andrews_blanc-CHc9YYqz.png" 
                                        alt="Groupe Nolet & Andrews" 
                                        className="object-contain drop-shadow-sm opacity-95"
                                        layout
                                        initial={false}
                                        // INCREASED SIZES FOR INTRO MODE BY ~30%
                                        // UPDATED: Increased Grid Mode size (~30% bigger)
                                        animate={{
                                            width: isIntroMode ? "60%" : (isAnyActive ? "80%" : "85%"), // 70% -> 85%
                                            maxWidth: isIntroMode ? "650px" : (isAnyActive ? "150px" : "320px"), // 240px -> 320px
                                        }}
                                        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }} 
                                    />
                                     {isAnyActive && (
                                         <motion.div
                                            className="w-full flex justify-center mt-8" // INCREASED Margin Top
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto', scale: 1 }}
                                            transition={{ duration: 0.4 }}
                                         >
                                             <div className="flex flex-col items-center mt-2">
                                                <div className="h-px w-6 bg-white/30 mb-2" />
                                                <span className="text-white/70 text-[10px] font-light tracking-widest uppercase text-center leading-none">
                                                {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' }).charAt(0).toUpperCase() + new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' }).slice(1)}
                                                </span>
                                            </div>
                                         </motion.div>
                                     )}
                                </motion.div>
                                
                                <AnimatePresence>
                                    {isIntroMode && (
                                        <>
                                            {/* SEPARATED TEXT BLOCK FOR STAGGERED FADE OUT */}
                                            {/* IMPORTANT: Keep in DOM during fade out (isIntroExiting) to prevent logo slide down */}
                                            <motion.div
                                                key="intro-text-content"
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ 
                                                    opacity: isIntroExiting ? 0 : 1, 
                                                    height: 'auto', 
                                                    marginTop: '2rem' 
                                                }}
                                                // Only animate height on actual unmount (end of intro mode), not during fade sequence
                                                exit={{ opacity: 0, height: 0, marginTop: 0, transition: { duration: 0.2 } }}
                                                transition={{ 
                                                    opacity: { duration: 0.4, delay: isIntroExiting ? 0.25 : 0 },
                                                    height: { duration: 0 }, 
                                                    marginTop: { duration: 0 }
                                                }}
                                                className={`flex flex-col items-center text-center max-w-2xl ${isIntroExiting ? 'pointer-events-none' : ''}`}
                                            >
                                                <motion.h1 
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: 0.6, duration: 0.8 }}
                                                    className="text-white text-3xl md:text-5xl xl:text-6xl font-light tracking-tight mb-4 drop-shadow-lg"
                                                >
                                                    Bienvenue
                                                </motion.h1>
                                                <motion.p 
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 0.8 }}
                                                    transition={{ delay: 1.2, duration: 0.8 }}
                                                    className="text-white/80 text-sm md:text-lg xl:text-xl uppercase tracking-widest font-light"
                                                >
                                                    Une vision 360° de vos affaires
                                                </motion.p>
                                            </motion.div>

                                            {/* SEPARATED BUTTON BLOCK FOR IMMEDIATE FADE OUT */}
                                            <motion.div
                                                key="intro-click-indicator"
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: isIntroExiting ? 0 : 1 }}
                                                transition={{ 
                                                    opacity: { duration: 0.2, delay: isIntroExiting ? 0 : 2 }
                                                }}
                                                exit={{ opacity: 0 }}
                                                className={`mt-12 flex flex-col items-center gap-2 animate-bounce cursor-pointer ${isIntroExiting ? 'pointer-events-none' : ''}`}
                                            >
                                                <MousePointerClick className="w-6 h-6 text-white/50" />
                                                <span className="text-white/50 text-[10px] uppercase tracking-widest">Cliquez pour entrer</span>
                                            </motion.div>
                                        </>
                                    )}
                                </AnimatePresence>
                             </div>

                            {/* CENTERED BOTTOM "ACCUEIL" BUTTON - Active Mode */}
                            {!isIntroMode && isAnyActive && onBackToIntro && (
                                <motion.div 
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.5, duration: 0.5 }}
                                    className="absolute bottom-0 left-0 w-full flex justify-center pb-24 md:pb-28"
                                >
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); onBackToIntro(); }}
                                        className="flex items-center gap-2 text-white/80 hover:text-white transition-colors bg-white/10 hover:bg-white/20 border border-white/10 px-6 py-2 rounded-full backdrop-blur-md shadow-lg pointer-events-auto"
                                    >
                                        <span className="text-xs uppercase tracking-widest font-medium">Accueil</span>
                                        <RotateCcw className="w-3.5 h-3.5" />
                                    </button>
                                </motion.div>
                            )}

                             {/* CENTERED "ACCUEIL" BUTTON & DESCRIPTION - Closed/Grid Mode */}
                             {/* WRAPPED IN ANIMATE PRESENCE TO PREVENT DEFORMATION */}
                             <AnimatePresence>
                                {!isIntroMode && !isAnyActive && (
                                    <>
                                        {/* BUTTON */}
                                        {onBackToIntro && (
                                            <motion.div 
                                                key="hero-back-btn"
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1, transition: { duration: 0.5, delay: 0.2 } }}
                                                exit={{ opacity: 0, transition: { duration: 0.2 } }}
                                                className="absolute bottom-32 md:bottom-44 xl:bottom-60 left-0 w-full flex justify-center z-30"
                                            >
                                                <button 
                                                    onClick={(e) => { e.stopPropagation(); onBackToIntro(); }}
                                                    className="flex items-center gap-2 text-white/80 hover:text-white transition-colors bg-black/20 hover:bg-black/30 border border-white/5 px-6 py-2 rounded-full backdrop-blur-sm shadow-lg pointer-events-auto"
                                                >
                                                    <span className="text-xs uppercase tracking-widest font-medium">Accueil</span>
                                                    <RotateCcw className="w-3.5 h-3.5" />
                                                </button>
                                            </motion.div>
                                        )}

                                        {/* DESCRIPTION (SUBTEXT) */}
                                        <motion.div 
                                            key="hero-description"
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ 
                                                opacity: (isIntroMode || !introAnimationFinished) ? 0 : 1, 
                                                x: (isIntroMode || !introAnimationFinished) ? -20 : 0,
                                                transition: { duration: 0.4, delay: 0.2 } 
                                            }}
                                            exit={{ opacity: 0, x: -10, transition: { duration: 0.2 } }}
                                            className="absolute bottom-0 left-0 w-full pointer-events-none flex flex-col justify-center md:pb-20 xl:pb-32"
                                            style={{ height: 'calc(100% / 6)' }}
                                        >
                                            <div className="w-full px-8 xl:px-12 flex justify-start">
                                                <div className="border-l-2 border-white/40 pl-4 hidden md:block">
                                                    {/* Added min-w-[240px] to prevent text reflow/squashing during exit animation */}
                                                    <p className="font-normal text-xs md:text-sm lg:text-base xl:text-lg leading-snug text-slate-100 max-w-[240px] xl:max-w-[320px] min-w-[240px] drop-shadow-md">
                                                    {item.description}
                                                    </p>
                                                </div>
                                            </div>
                                        </motion.div>
                                    </>
                                )}
                             </AnimatePresence>

                        </div>
                    )}
                </div>
            ) : (
                <AnimatePresence mode="wait">
                    {/* BUTTON MODE (Sidebar active) OR INTRO PALETTE MODE OR PORTRAIT NAV */}
                    {(isButtonMode || isIntroMode || isPortrait) ? (
                        <motion.div
                            key="compact-mode"
                            initial={isPortrait ? { opacity: 1 } : { opacity: 0, scale: 0.8 }} 
                            animate={{ 
                                opacity: isIntroExiting ? 0 : 1, 
                                scale: 1,
                                transition: { 
                                    delay: isIntroMode ? (isIntroExiting ? 0.2 : 0) : (isPortrait ? 0 : 0.55), 
                                    duration: 0.4, 
                                    ease: "easeOut" 
                                } 
                            }}
                            exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.15 } }}
                            className={`w-full h-full flex flex-col items-center justify-center text-center p-2 ${item.textClass} ${isBottomRowTile && !isIntroMode && !isPortrait ? 'md:pb-14' : ''}`}
                        >
                            <div className={`${isActive ? 'opacity-100 scale-110' : 'opacity-70 group-hover:opacity-100'} transition-transform duration-300 relative z-20`}>
                                {item.icon && (
                                    <item.icon 
                                        className={isIntroMode 
                                            ? "w-6 h-6 md:w-8 md:h-8 opacity-80" 
                                            : "w-5 h-5 md:w-6 md:h-6"
                                        } 
                                    />
                                )}
                            </div>
                            
                            {/* In Portrait mode, assume always showing icon + small title if space permits, or just icon if very small */}
                            {(!isIntroMode || isPortrait) && (
                                <AnimatePresence mode="wait">
                                    {(isActive && !isPortrait) ? (
                                        <motion.div
                                            key="arrow"
                                            initial={{ opacity: 0, y: -5 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: 5 }}
                                            transition={{ duration: 0.25 }}
                                            className="mt-2"
                                        >
                                            {isLeft ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
                                        </motion.div>
                                    ) : (
                                        <>
                                            <motion.h3
                                                key="title"
                                                initial={{ opacity: 0, y: 5 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -5 }}
                                                transition={{ duration: 0.25 }}
                                                // ADDED: whitespace-normal break-words leading-[0.9rem] for text wrapping
                                                className={`hidden md:block font-medium uppercase tracking-wider leading-[0.9rem] whitespace-normal break-words w-full px-1 mt-2 opacity-80 text-[10px] relative z-20`}
                                            >
                                                {item.title}
                                            </motion.h3>
                                        </>
                                    )}
                                </AnimatePresence>
                            )}
                        </motion.div>
                    ) : (
                        // STANDARD GRID MODE
                        <motion.div
                            key="grid-mode"
                            initial={{ opacity: 0 }}
                            animate={isExiting 
                              ? { opacity: 0, transition: { duration: 0.25 } } 
                              : { 
                                  opacity: (!introAnimationFinished && !isIntroMode) ? 0 : 1, 
                                  transition: { 
                                      delay: introAnimationFinished ? 0 : 0.85, 
                                      duration: 0.5 
                                  } 
                                }
                            }
                            exit={{ opacity: 0, transition: { duration: 0 } }}
                            className={`w-full h-full flex flex-col justify-between ${item.textClass} relative overflow-hidden
                                p-4 
                                ${isRightSide 
                                    ? 'md:py-5 md:pr-5 md:pl-10 xl:py-8 xl:pr-8 xl:pl-12' 
                                    : 'md:p-5 xl:p-8'
                                }
                            `}
                        >
                            <div className="absolute top-4 right-4 xl:top-6 xl:right-6 z-10">
                                 <ArrowUpRight className="w-4 h-4 md:w-5 md:h-5 lg:w-6 lg:h-6 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>

                             <div className="flex flex-row items-center gap-3 w-full pr-6">
                                <div className="shrink-0">
                                    {item.icon && <item.icon className="w-4 h-4 md:w-5 md:h-5 lg:w-6 lg:h-6 xl:w-8 xl:h-8" />}
                                </div>
                                <div className="flex flex-col gap-0.5">
                                    <h3 className="font-normal text-sm md:text-base lg:text-lg xl:text-xl 2xl:text-2xl leading-tight tracking-tight">
                                        {item.title}
                                    </h3>
                                    {item.subtitle && (
                                        <p className="text-[9px] md:text-[10px] lg:text-xs xl:text-sm font-normal tracking-wide opacity-70">
                                        {item.subtitle}
                                        </p>
                                    )}
                                </div>
                             </div>

                             <p className="mt-2 text-[10px] md:text-xs lg:text-sm xl:text-base opacity-80 line-clamp-2 leading-tight md:leading-relaxed font-light">
                                {item.description}
                             </p>
                        </motion.div>
                    )}
                </AnimatePresence>
            )}
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default Tile;