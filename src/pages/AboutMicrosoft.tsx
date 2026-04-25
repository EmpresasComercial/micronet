import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { motion } from 'motion/react';
import { useLanguage } from '../contexts/LanguageContext';

export default function AboutMicrosoft() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const values = [
    {
      title: t('about.mission_title'),
      description: t('about.mission_desc')
    },
    {
      title: t('about.vision_label'),
      description: t('about.vision_p1')
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <header className="bg-white p-4 flex items-center sticky top-0 z-50 border-b border-[#e1e1e1]">
        <button 
          onClick={() => navigate('/perfil')} 
          className="p-2 -ml-2 text-gray-600 hover:text-ms-blue transition-colors"
          aria-label="Voltar para o perfil"
          title="Voltar"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <span className="text-xl font-semibold ml-2 text-gray-900">{t('about.header')}</span>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-20 space-y-24">
        <section className="space-y-12">
          <motion.img 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            src="https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg" 
            alt="Microsoft" 
            className="h-10 md:h-12"
            referrerPolicy="no-referrer"
          />
          
          <div className="space-y-8 text-left">
            <h1 className="text-5xl md:text-6xl font-light text-[#2b2b2b] tracking-tight leading-[1.1]">
              {t('about.hero_title')}
            </h1>
            <p className="text-xl text-[#616161] font-light max-w-2xl leading-relaxed">
              {t('about.hero_sub')}
            </p>
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-12 gap-16 items-start text-left">
          <div className="md:col-span-4 space-y-6 sticky top-24">
            <h2 className="text-sm font-bold text-ms-blue uppercase tracking-[0.3em]">{t('about.vision_label')}</h2>
            <p className="text-2xl font-light text-[#2b2b2b] leading-tight">{t('about.vision_title')}</p>
          </div>
          <div className="md:col-span-8 space-y-8 text-[#616161] leading-relaxed text-lg font-light">
            <p>{t('about.vision_p1')}</p>
            <p>{t('about.vision_p2')}</p>
          </div>
        </section>

        <section className="bg-[#f2f2f2] -mx-6 md:-mx-20 px-6 md:px-20 py-24 space-y-16 text-left">
          <div className="max-w-3xl mx-auto space-y-12">
            <div className="space-y-4">
              <h3 className="text-4xl font-light text-[#2b2b2b] leading-tight">{t('about.local_title')}</h3>
            </div>

            <div className="bg-white p-8 md:p-12 shadow-sm border border-[#e1e1e1] space-y-10">
              <div className="space-y-6">
                <p className="text-[#616161] leading-relaxed font-light">
                  {t('about.local_p1')}
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-16 border-t border-[#e1e1e1] pt-24 text-left">
          <div className="max-w-3xl">
            <h2 className="text-3xl font-light text-[#2b2b2b] mb-12">{t('about.commitments')}</h2>
            
            <div className="space-y-16">
              {values.map((val, idx) => (
                <div key={idx} className="group space-y-4">
                  <div className="flex items-center space-x-4">
                    <span className="text-[10px] font-black text-gray-300 group-hover:text-ms-blue transition-colors uppercase tracking-[0.4em]">0{idx + 1}</span>
                    <h3 className="text-xl font-semibold text-[#2b2b2b]">{val.title}</h3>
                  </div>
                  <p className="text-base text-[#616161] leading-relaxed font-light pl-11">
                    {val.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="pt-10 border-t border-gray-100 grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="text-center group">
            <p className="text-4xl font-light text-ms-blue mb-1">1975</p>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">{t('about.stat_foundation')}</p>
          </div>
          <div className="text-center group">
            <p className="text-4xl font-light text-ms-blue mb-1">190+</p>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">{t('about.stat_countries')}</p>
          </div>
          <div className="text-center group">
            <p className="text-4xl font-light text-ms-blue mb-1">220k+</p>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">{t('about.stat_people')}</p>
          </div>
          <div className="text-center group">
            <p className="text-4xl font-light text-ms-blue mb-1">1.4B+</p>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">{t('about.stat_licenses')}</p>
          </div>
        </section>

        <section className="py-20 text-center max-w-3xl mx-auto space-y-6">
          <p className="text-2xl font-light text-gray-500 italic leading-snug">
            {t('about.quote')}
          </p>
          <div className="space-y-1">
            <p className="font-bold text-gray-900 text-sm uppercase tracking-widest">Satya Nadella</p>
            <p className="text-xs text-gray-400 font-medium">CEO, Microsoft</p>
          </div>
        </section>

        <footer className="pt-16 pb-12 border-t border-gray-100">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <img 
              src="https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg" 
              alt="Microsoft" 
              className="h-4"
              referrerPolicy="no-referrer"
            />
            <p className="text-[10px] text-gray-400 uppercase font-bold tracking-[0.2em]">
              {t('about.rights')}
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
