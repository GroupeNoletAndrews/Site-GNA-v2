import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GRID_ITEMS } from '../../constants';
import TileContent from './TileContent';
import { X } from 'lucide-react';
import { useI18n } from '../../contexts/I18nContext';

interface CentralPageProps {
  activeId: string | null;
  onClose: () => void;
  isPortrait?: boolean; // NEW: Vertical Layout Check
}

const CentralPage: React.FC<CentralPageProps> = ({ activeId, onClose, isPortrait = false }) => {
  const { t } = useI18n();
  const activeItem = GRID_ITEMS.find(item => item.id === activeId);
  
  // Helper function to get translated text for item properties
  const getTranslatedItem = (item: typeof activeItem) => {
    if (!item) return { title: '', subtitle: '' };
    
    const tileKey = item.id;
    const translatedTitleKey = `${tileKey}.title`;
    const translatedTitleValue = t(translatedTitleKey);
    const translatedTitle = translatedTitleValue !== translatedTitleKey ? translatedTitleValue : item.title;
    
    const translatedSubtitle = item.subtitle ? (() => {
      const key = `${tileKey}.subtitle`;
      const value = t(key);
      return value !== key ? value : item.subtitle;
    })() : item.subtitle;
    
    return { title: translatedTitle, subtitle: translatedSubtitle };
  };
  
  const translatedItem = activeItem ? getTranslatedItem(activeItem) : { title: '', subtitle: '' };

  // Définition des IDs qui se trouvent visuellement à GAUCHE dans le layout 'Active'
  // (Maintenant dans la colonne 2)
  const LEFT_SIDE_IDS = ['automatisation', 'dev-solutions', 'optimisation', 'maintenance', 'contact'];
  
  // Détermine la direction de l'animation
  // Si Portrait, on peut animer depuis le bas (Y axis) plutôt que le côté
  const isLeft = activeItem ? LEFT_SIDE_IDS.includes(activeItem.id) : true;
  
  const xOffset = isPortrait ? 0 : (isLeft ? -120 : 120);
  const yOffset = isPortrait ? 120 : 0;

  // Détermine si le thème est sombre (texte blanc) ou clair (texte foncé)
  const isDark = activeItem ? activeItem.textClass.includes('text-white') : false;

  // Styles pour l'effet Glassmorphism du header selon le thème
  // Thème Sombre (Fond Vert) : Glass blanc très léger
  // Thème Clair (Fond Beige) : Glass noir très léger ou blanc teinté
  const headerGlassClass = isDark
    ? 'bg-white/10 backdrop-blur-md border-b border-white/10'
    : 'bg-white/40 backdrop-blur-md border-b border-black/5';

  // --- GRID POSITION LOGIC ---
  // Default (Landscape): Col 3-11, Row 1-6
  // Portrait: Col 1-12, Row 2-6 (Hero is Row 1)
  const gridPositionClass = isPortrait
    ? 'col-span-1 row-start-2 row-span-5 md:col-start-1 md:col-span-12 md:row-start-2 md:row-end-7'
    : 'col-span-1 row-start-1 row-span-6 md:col-start-3 md:col-end-12 md:row-start-1 md:row-end-7';

  return (
    <div 
        className="absolute inset-0 w-full h-full pointer-events-none z-0 grid grid-cols-1 md:grid-cols-12 gap-0"
        style={{ gridTemplateRows: 'repeat(5, calc((100vh - 5rem) / 6)) minmax(0, 1fr)' }}
    >
      {/* 
        Positionnement de la page centrale.
      */}
      <div className={`${gridPositionClass} relative pointer-events-auto z-10 overflow-hidden md:-ml-px md:w-[calc(100%+1px)]`}>
        
        <AnimatePresence mode="popLayout">
          {activeItem && (
            <motion.div
              key={activeItem.id}
              // APPLIQUE LE BACKGROUND DE LA TUILE ET LA COULEUR DE TEXTE À TOUTE LA PAGE
              className={`w-full h-full shadow-2xl flex flex-col ${activeItem.bgClass} ${activeItem.textClass}`}
              
              // Animation Directionnelle Latérale ou Verticale
              initial={{ 
                opacity: 0, 
                scale: 0.95, 
                x: xOffset, 
                y: yOffset,
                filter: "blur(12px)", 
                zIndex: 2 
              }}
              animate={{ 
                opacity: 1, 
                scale: 1, 
                x: 0, 
                y: 0,
                filter: "blur(0px)",
                zIndex: 2,
                transition: { 
                  duration: 0.65, 
                  ease: [0.2, 0.8, 0.2, 1],
                  delay: 0.2 
                }
              }}
              exit={{ 
                opacity: 0, 
                scale: 0.9, 
                filter: "blur(10px)",
                zIndex: 1, 
                transition: { duration: 0.3 } 
              }}
            >
              {/* 
                 Header de la page avec effet GLASSMORPHISM
                 Header Height matched to 1 grid row roughly
              */}
              <div 
                className={`w-full px-8 md:px-12 xl:px-20 py-5 md:py-0 relative shrink-0 z-20 flex flex-col justify-center ${headerGlassClass}`}
                style={{ height: 'calc((100vh - 5rem) / 6)' }} 
              >
                {/* 
                    CLOSE BUTTON 
                    Couleur adaptée via 'text-current' et fond semi-transparent
                */}
                <button 
                  onClick={onClose}
                  className={`absolute top-5 right-6 md:top-1/2 md:-translate-y-1/2 p-2.5 xl:p-4 rounded-full transition-all text-current z-50 shadow-lg ${isDark ? 'bg-white/10 hover:bg-white/20 border border-white/10' : 'bg-black/5 hover:bg-black/10 border border-black/5'}`}
                >
                  <X className="w-5 h-5 xl:w-6 xl:h-6" />
                </button>

                <div className="flex flex-col gap-2 md:gap-3">
                  <motion.div 
                    layoutId={`icon-${activeItem.id}`} 
                    className={`self-start p-2 xl:p-3 rounded-xl backdrop-blur-sm ${isDark ? 'bg-white/20' : 'bg-black/5'}`}
                  >
                    {activeItem.icon && <activeItem.icon className="w-5 h-5 md:w-6 md:h-6 xl:w-8 xl:h-8" />}
                  </motion.div>
                  
                  <div>
                    <motion.h2 layoutId={`title-${activeItem.id}`} className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-normal mb-1 tracking-tight truncate">
                      {translatedItem.title}
                    </motion.h2>
                    
                    {activeItem.subtitle && (
                      <motion.p layoutId={`sub-${activeItem.id}`} className="text-xs md:text-sm xl:text-base opacity-70 uppercase tracking-widest font-light">
                        {translatedItem.subtitle}
                      </motion.p>
                    )}
                  </div>
                </div>
              </div>

              {/* Corps du contenu - Transparent pour laisser voir le bgClass du parent */}
              <div className="flex-grow relative overflow-hidden">
                <TileContent item={activeItem} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default CentralPage;