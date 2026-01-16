import React from 'react';
import { motion } from 'framer-motion';
import { VISION_ITEMS } from '../../constants';

/**
 * VisionBar Component (Ultra Compact)
 * 
 * Increased height to h-20 (80px) on desktop to balance the grid aspect ratio (1x1 tiles).
 * Hidden on mobile.
 */
const VisionBar: React.FC = () => {
  return (
    <div className="hidden md:flex w-full h-10 md:h-20 items-center bg-white border-t border-slate-200 z-50 relative shadow-sm transition-all duration-300">
      <div className="w-full h-full flex overflow-x-auto no-scrollbar md:justify-center">
        {VISION_ITEMS.map((vision, index) => (
          <div
            key={vision.id}
            className="flex-shrink-0 flex items-center justify-center px-4 md:px-8 h-full border-r border-slate-100 last:border-r-0 hover:bg-slate-50 transition-colors cursor-default group relative"
          >
            <div className="flex items-center gap-3 text-slate-400 group-hover:text-[#E8772E] transition-colors">
              <vision.icon className="w-3.5 h-3.5 md:w-5 md:h-5" />
              <span className="font-medium text-[10px] md:text-sm uppercase tracking-wide text-slate-800">
                {vision.label}
              </span>
            </div>
            
            {/* Tooltip style description on hover (Desktop) */}
            <div className="hidden md:block absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-48 bg-slate-900 text-white text-[10px] p-2 rounded shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 text-center font-light leading-snug">
              {vision.description}
              <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VisionBar;