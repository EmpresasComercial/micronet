import React from 'react';
import { motion } from 'motion/react';
import { Cloud } from 'lucide-react';
import { useLanguage } from '../../../contexts/LanguageContext';

export const HeroSection: React.FC = () => {
  const { t } = useLanguage();
  
  return (
    <section className="relative h-[280px] bg-[#0067b8] overflow-hidden flex items-center px-6">
      <div className="relative z-10 text-white max-w-sm">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <Cloud className="w-10 h-10 mb-4 opacity-50" />
          <h1 className="text-3xl font-bold leading-tight mb-2">{t('home.welcome_hero')}</h1>
          <p className="text-white/80 text-sm">{t('home.hero_sub')}</p>
        </motion.div>
      </div>
      
      <div className="absolute right-[-10%] top-0 bottom-0 w-[60%] opacity-20 overflow-hidden pointer-events-none">
          <img 
            src="/micro-carrocel.webp" 
            alt="" 
            className="w-full h-full object-contain blur-[2px]" 
          />
      </div>
    </section>
  );
};
