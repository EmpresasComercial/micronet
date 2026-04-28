import React, { useState, useEffect } from 'react';
import { Activity, Megaphone, ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { Button } from '../components/Button';
import { usePopup } from '../hooks/usePopup';
import { APP_CONFIG } from '../constants/config';
import { supabase } from '../lib/supabase';
import { HeroSection } from './Home/components/HeroSection';
import { StatsGrid } from './Home/components/StatsGrid';
import { AnnouncementPopup } from './Home/components/AnnouncementPopup';

export default function Home() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const [accountData, setAccountData] = useState({
    saldo_disponivel: 0,
    total_recarregado: 0,
    total_retirado: 0,
  });

  useEffect(() => {
    supabase.rpc('get_my_account_data').then(({ data }) => {
      if (data && data.length > 0) setAccountData(data[0]);
    });
  }, []);


  const { isOpen: showPopup, close: closePopup } = usePopup({
    initialDelay: APP_CONFIG.POPUP_INITIAL_DELAY,
    autoCloseTime: APP_CONFIG.POPUP_AUTO_CLOSE_TIME
  });

  return (
    <div className="bg-white relative">
      <AnnouncementPopup isOpen={showPopup} onClose={closePopup} />

      <HeroSection />

      <StatsGrid
        totalUsdt={accountData.saldo_disponivel}
        totalRecarregado={accountData.total_recarregado}
        totalRetirado={accountData.total_retirado}
      />

      <div className="px-4 space-y-6 pb-8">
        <div className="flex items-center space-x-3 bg-[#fff8f0] border border-[#ffebcc] p-2 rounded-sm overflow-hidden">
          <div className="bg-[#a66d00] p-1.5 rounded-sm text-white shrink-0 z-10">
            <Megaphone size={14} className="rotate-12" />
          </div>
          <div className="flex-1 overflow-hidden relative h-5">
            <div className="whitespace-nowrap absolute animate-marquee inline-block text-xs font-semibold text-[#a66d00]">
              {t('home.marquee')}
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <button 
              onClick={() => navigate('/recarregar')}
              className="bg-white border border-[#e1e1e1] text-gray-700 py-3 rounded-sm shadow-sm flex items-center justify-center space-x-2 transition-all active:scale-95 active:bg-gray-50"
            >
              <ArrowDownLeft size={18} className="text-ms-blue" strokeWidth={1.5} />
              <span className="text-[11px] font-bold uppercase tracking-[0.1em]">{t('profile.recharge')}</span>
            </button>
            <button 
              onClick={() => navigate('/retirada')}
              className="bg-white border border-[#e1e1e1] text-gray-700 py-3 rounded-sm shadow-sm flex items-center justify-center space-x-2 transition-all active:scale-95 active:bg-gray-50"
            >
              <ArrowUpRight size={18} className="text-ms-blue" strokeWidth={1.5} />
              <span className="text-[11px] font-bold uppercase tracking-[0.1em]">{t('profile.withdraw')}</span>
            </button>
          </div>
          <Button 
            onClick={() => navigate('/operacoes')}
            className="w-full h-[54px] shadow-lg shadow-ms-blue/20"
          >
            <div className="flex items-center space-x-3">
              <Activity size={20} strokeWidth={1.5} />
              <span className="text-xs font-bold uppercase tracking-[0.2em]">{t('profile.operations')}</span>
            </div>
          </Button>
        </div>


        <div className="ms-card p-8 text-center border-dashed">
           <h3 className="text-gray-900 font-semibold mb-2">{t('home.doubts')}</h3>
           <p className="text-sm text-gray-600 mb-6">{t('home.support_cta')}</p>
           <Button 
             variant="outline"
             onClick={() => navigate('/suporte')}
             className="px-8 py-2 font-semibold text-sm border-ms-blue text-ms-blue hover:bg-ms-blue hover:text-white"
           >
             {t('home.support_btn')}
           </Button>
        </div>
      </div>
    </div>
  );
}

