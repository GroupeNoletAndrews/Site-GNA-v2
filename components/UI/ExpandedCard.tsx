import React from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { GridItem } from '../../types';

interface ExpandedCardProps {
  item: GridItem;
  onClose: () => void;
}

/**
 * ExpandedCard Component
 * 
 * Displays the full content of a tile when clicked.
 * Uses layoutId to seamlessly animate from the grid position to this modal overlay.
 */
const ExpandedCard: React.FC<ExpandedCardProps> = ({ item, onClose }) => {
  // NEW: Bouton background dynamique selon le thème de la carte
  const buttonBgClass = item.textClass.includes('text-white') 
    ? 'bg-white/10 hover:bg-white/20' 
    : 'bg-black/5 hover:bg-black/20';

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center md:p-12 pointer-events-none">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm pointer-events-auto"
      />
      
      {/* Active Card */}
      <motion.div
        layoutId={`card-${item.id}`}
        className={`relative w-full md:max-w-3xl h-[85vh] md:h-[70vh] rounded-t-3xl md:rounded-3xl overflow-hidden shadow-2xl pointer-events-auto flex flex-col ${item.bgClass}`}
      >
        {/* Drag handle for mobile visual cue (optional but good for UX) */}
        <div className="md:hidden absolute top-3 left-1/2 -translate-x-1/2 w-12 h-1.5 bg-black/10 rounded-full z-20" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className={`absolute top-6 right-6 z-20 p-2 ${buttonBgClass} rounded-full transition-colors text-current`}
        >
          <X className={`w-6 h-6 ${item.textClass}`} />
        </button>

        {/* Content */}
        <div className={`p-6 md:p-10 flex flex-col h-full ${item.textClass}`}>
          {/* Header Section */}
          <div className="mb-6 md:mb-8 mt-4 md:mt-0">
            <motion.h2 
              layoutId={`title-${item.id}`}
              className="text-3xl md:text-6xl font-normal mb-2 md:mb-4 tracking-tight"
            >
              {item.title}
            </motion.h2>
            {item.subtitle && (
              <motion.span 
                layoutId={`sub-${item.id}`}
                className="text-lg md:text-xl opacity-70 font-light uppercase tracking-widest"
              >
                {item.subtitle}
              </motion.span>
            )}
          </div>

          {/* Main Body */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex-grow flex flex-col md:flex-row gap-6 md:gap-8 overflow-y-auto no-scrollbar pb-8"
          >
            <div className="flex-1 order-2 md:order-1">
              <p className="text-lg md:text-2xl leading-relaxed font-light opacity-90">
                {item.description}
              </p>
              
              {/* Placeholder Text Content */}
              <div className="mt-8 space-y-4">
                <p className="opacity-80 leading-relaxed font-light">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                </p>
                <div className="h-4 w-3/4 bg-current opacity-20 rounded animate-pulse" />
                <div className="h-4 w-full bg-current opacity-10 rounded animate-pulse" />
                <div className="h-4 w-5/6 bg-current opacity-10 rounded animate-pulse" />
              </div>
            </div>

            {/* Visual element for expansion */}
            <div className="flex-1 order-1 md:order-2 bg-black/5 rounded-2xl flex items-center justify-center min-h-[180px] md:min-h-[200px] shrink-0">
              {item.icon ? (
                 <item.icon className="w-24 h-24 md:w-32 md:h-32 opacity-20" />
              ) : item.imageUrl ? (
                <img src={item.imageUrl} alt="Detail" className="w-full h-full object-cover opacity-80 mix-blend-multiply" />
              ) : (
                <div className="text-sm opacity-50 font-light">Contenu Visuel</div>
              )}
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default ExpandedCard;