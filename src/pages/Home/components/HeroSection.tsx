import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '../../../contexts/LanguageContext';
import { useCarousel } from '../../../hooks/useCarousel';
import { CAROUSEL_IMAGES } from '../../../constants/images';
import { APP_CONFIG } from '../../../constants/config';

export const HeroSection: React.FC = () => {
  const { t } = useLanguage();
  const { currentIndex } = useCarousel({
    itemsCount: CAROUSEL_IMAGES.length,
    interval: APP_CONFIG.CAROUSEL_INTERVAL,
  });

  return (
    <section className="relative h-[160px] overflow-hidden">
      {/* Carousel slides */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
          className="absolute inset-0 w-full h-full"
        >
          {/* Blurred bg */}
          <img
            src={CAROUSEL_IMAGES[currentIndex]}
            alt=""
            className="absolute inset-0 w-full h-full object-cover blur-lg opacity-40 scale-110"
          />
          {/* Blue overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#0052a3]/90 via-[#0067b8]/80 to-[#0067b8]/60" />
        </motion.div>
      </AnimatePresence>

      {/* Content */}
      <div className="relative z-10 h-full flex items-center justify-between px-5">
        {/* Left text */}
        <div className="text-white flex-1">
          <motion.div
            key={`text-${currentIndex}`}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            {/* Cloud icon */}
            <svg className="w-5 h-5 mb-2 opacity-60" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15a4.5 4.5 0 004.5 4.5H18a3.75 3.75 0 001.332-7.257 3 3 0 00-3.758-3.848 5.25 5.25 0 00-10.233 2.33A4.502 4.502 0 002.25 15z" />
            </svg>
            <h1 className="text-[17px] font-bold leading-snug mb-1">{t('home.welcome_hero')}</h1>
            <p className="text-white/70 text-[11px] leading-snug max-w-[200px]">{t('home.hero_sub')}</p>
          </motion.div>
        </div>

        {/* Right — current slide image */}
        <motion.div
          key={`img-${currentIndex}`}
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="w-[100px] h-[100px] shrink-0 ml-4 flex items-center justify-center"
        >
          <img
            src={CAROUSEL_IMAGES[currentIndex]}
            alt={`Slide ${currentIndex + 1}`}
            className="w-full h-full object-contain drop-shadow-md"
            referrerPolicy="no-referrer"
          />
        </motion.div>
      </div>

      {/* Dots indicator */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex space-x-1.5 z-20">
        {CAROUSEL_IMAGES.map((_, i) => (
          <div
            key={i}
            className={`h-1 rounded-full transition-all duration-300 ${
              i === currentIndex ? 'w-4 bg-white' : 'w-1 bg-white/40'
            }`}
          />
        ))}
      </div>
    </section>
  );
};
