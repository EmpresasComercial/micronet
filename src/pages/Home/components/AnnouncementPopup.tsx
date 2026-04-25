import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Megaphone, X, MessageCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { useLanguage } from '../../../contexts/LanguageContext';
import { APP_CONFIG } from '../../../constants/config';

interface AnnouncementPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AnnouncementPopup: React.FC<AnnouncementPopupProps> = ({ isOpen, onClose }) => {
  const { t } = useLanguage();
  const [popupIndex, setPopupIndex] = useState(0);

  const announcements = [
    {
      title: t('home.announcement.title1'),
      content: t('home.announcement.content1'),
      link: "/produtos",
      linkText: t('nav.products'),
      isWhatsApp: false
    },
    {
      title: t('home.announcement.title2'),
      content: t('home.announcement.content2'),
      link: "/convite",
      linkText: t('nav.invite'),
      isWhatsApp: false
    },
    {
      title: t('home.announcement.title3'),
      content: t('home.announcement.content3'),
      link: APP_CONFIG.WHATSAPP_COMMUNITY_LINK, 
      linkText: t('home.community_btn'),
      isWhatsApp: true
    }
  ];

  const handleNextPopup = () => {
    setPopupIndex((prev) => (prev + 1) % announcements.length);
  };

  const handlePrevPopup = () => {
    setPopupIndex((prev) => (prev - 1 + announcements.length) % announcements.length);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/10 backdrop-blur-[1.5px]">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 30 }}
            className="bg-white w-full max-w-sm rounded-sm shadow-[0_20px_60px_rgba(0,0,0,0.5)] border border-[#e1e1e1] relative"
          >
            <div className="absolute -top-6 -left-6 z-20 bg-[#0067b8] text-white p-4 rounded-sm shadow-[0_10px_20px_rgba(0,103,184,0.4)] rotate-[-12deg]">
              <Megaphone size={32} />
            </div>

            <div className="p-2 flex items-center justify-end">
              <button 
                onClick={onClose} 
                title={t('common.close')}
                className="text-[#616161] hover:bg-[#f2f2f2] p-1 rounded-sm transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="px-6 pb-6 space-y-4 relative z-10">
              <div className="space-y-4 max-h-[260px] overflow-y-auto pr-2 custom-scrollbar">
                <h3 className="text-2xl font-semibold text-[#2b2b2b] leading-tight pr-6">
                  {announcements[popupIndex].title}
                </h3>
                <div className="text-sm text-[#444] leading-relaxed whitespace-pre-line font-medium">
                  {announcements[popupIndex].content}
                </div>
              </div>

              {announcements[popupIndex].isWhatsApp && (
                <a 
                  href={announcements[popupIndex].link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center justify-center space-x-2 w-full h-[45px] bg-[#25D366] text-white font-bold rounded-sm shadow-[0_4px_12px_rgba(37,211,102,0.3)] hover:opacity-90 transition-opacity uppercase text-[10px] tracking-widest mt-2"
                >
                  <MessageCircle size={14} />
                  <span>{t('home.community_btn')}</span>
                </a>
              )}
            </div>

            <div className="bg-[#f9f9f9] px-6 py-4 border-t border-[#e1e1e1] flex items-center justify-between mt-2">
              <div className="flex space-x-2">
                <button 
                  onClick={handlePrevPopup}
                  className="flex items-center space-x-1 px-4 h-[45px] bg-white border border-[#d2d2d2] text-[#2b2b2b] text-[10px] font-bold uppercase tracking-wider rounded-sm hover:bg-gray-50 active:scale-95 transition-all"
                >
                  <ChevronLeft size={14} />
                  <span>{t('common.prev')}</span>
                </button>
                <button 
                  onClick={handleNextPopup}
                  className="flex items-center space-x-1 px-4 h-[45px] bg-white border border-[#d2d2d2] text-[#2b2b2b] text-[10px] font-bold uppercase tracking-wider rounded-sm hover:bg-gray-50 active:scale-95 transition-all"
                >
                  <span>{t('common.next')}</span>
                  <ChevronRight size={14} />
                </button>
              </div>
              <button 
                onClick={onClose}
                className="px-8 h-[45px] bg-[#0067b8] text-white text-[10px] font-bold uppercase tracking-wider rounded-sm hover:bg-[#005a9e] active:scale-95 transition-all shadow-md shadow-ms-blue/20"
              >
                {t('common.close')}
              </button>
            </div>
            
            <motion.div 
              key={`progress-${isOpen}-${popupIndex}`}
              initial={{ width: "100%" }}
              animate={{ width: "0%" }}
              transition={{ duration: APP_CONFIG.POPUP_AUTO_CLOSE_TIME / 1000, ease: "linear" }}
              className="h-1 bg-[#0067b8]"
            />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
