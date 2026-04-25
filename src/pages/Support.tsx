import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, MessageCircle, Users, Headphones, ShieldCheck, Search, Send, Video, Facebook } from 'lucide-react';
import { motion } from 'motion/react';
import { Button } from '../components/Button';
import { useToast } from '../components/Toast';
import { useLanguage } from '../contexts/LanguageContext';
import { supabase } from '../lib/supabase';

export default function Support() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { t } = useLanguage();
  const [links, setLinks] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLinks() {
      const { data } = await supabase
        .from('atendimento_links')
        .select('*')
        .limit(1)
        .maybeSingle();
      
      if (data) setLinks(data);
      setLoading(false);
    }
    fetchLinks();
  }, []);

  const openLink = (url: string | null) => {
    if (url) {
      window.open(url, '_blank');
    } else {
      showToast('Link não disponível no momento.', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-[#f2f2f2] pb-20">
      <header className="bg-white px-4 py-3 flex items-center border-b border-[#e1e1e1] sticky top-0 z-50">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-sm transition-colors" title="Voltar">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <span className="ml-4 text-sm font-semibold text-gray-900">{t('support.header')}</span>
      </header>

      <section className="bg-white border-b border-[#e1e1e1] pt-12 pb-16 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-3xl md:text-4xl font-light text-gray-900 mb-8 tracking-tight">
            Como podemos ajudar?
          </h1>
          <div className="relative max-w-xl mx-auto">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <Search className="w-5 h-5 text-gray-400" />
            </div>
            <input 
              type="text" 
              placeholder={t('support.search_placeholder')} 
              className="w-full h-12 pl-12 pr-4 bg-white border-2 border-gray-900 rounded shadow-sm text-sm focus:outline-none focus:border-ms-blue transition-colors cursor-pointer"
              readOnly
              onClick={() => navigate('/help-faq')}
            />
          </div>
        </div>
      </section>

      <div className="p-6 max-w-lg mx-auto -mt-8">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="ms-card p-8 space-y-4"
        >
          <div className="flex items-center space-x-3 mb-2">
            <Headphones className="w-8 h-8 text-ms-blue opacity-20" />
            <img 
              src="https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg" 
              alt="Microsoft" 
              className="h-4"
              referrerPolicy="no-referrer"
            />
          </div>

          <div className="space-y-3">
            {/* Atendimento VIP */}
            <Button
              onClick={() => openLink(links?.whatsapp_gerente_url)}
              className="w-full flex items-center justify-between px-6 h-[45px] text-left rounded-sm"
              variant="primary"
            >
              <div className="flex items-center space-x-3">
                <MessageCircle className="w-5 h-5" />
                <div className="flex flex-col">
                  <span className="font-bold text-xs leading-none">Atendimento VIP (WhatsApp)</span>
                  <span className="text-[9px] opacity-70 mt-0.5 hidden md:block">Fale diretamente com seu gerente.</span>
                </div>
              </div>
              <span className="text-[9px] opacity-70 text-right max-w-[120px] hidden md:block">Fale diretamente com seu gerente de conta Microsoft.</span>
            </Button>

            {/* Grupo de Vendas */}
            <Button
              onClick={() => openLink(links?.whatsapp_grupo_vendas_url)}
              className="w-full flex items-center justify-between px-6 h-[45px] text-left border border-gray-200 text-gray-700 bg-white hover:bg-gray-50 rounded-sm"
            >
              <div className="flex items-center space-x-3">
                <Users className="w-5 h-5 text-gray-400" />
                <span className="font-bold text-xs">Grupo de Vendas Oficiais</span>
              </div>
              <span className="text-[9px] text-gray-400 text-right max-w-[120px] hidden md:block">Participe da comunidade e receba bônus diários.</span>
            </Button>

            {/* Canal Telegram */}
            <Button
              onClick={() => openLink(links?.telegram_url)}
              className="w-full flex items-center justify-between px-6 h-[45px] text-left border border-gray-200 text-gray-700 bg-white hover:bg-gray-50 rounded-sm"
            >
              <div className="flex items-center space-x-3">
                <Send className="w-5 h-5 text-gray-400" />
                <span className="font-bold text-xs">Canal Oficial Telegram</span>
              </div>
              <span className="text-[9px] text-gray-400 text-right max-w-[120px] hidden md:block">Notificações em tempo real sobre o Cloud Node.</span>
            </Button>

            {/* Outros Links (App, Facebook, Youtube) */}
            <div className="grid grid-cols-3 gap-3">
              <Button 
                onClick={() => openLink(links?.link_app_atualizado)}
                className="h-[45px] border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 flex items-center justify-center p-0 rounded-sm"
              >
                <img src="/microsoft-icon.png" alt="App" className="w-4 h-4 opacity-50" onError={(e) => e.currentTarget.src = 'https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg'} />
              </Button>
              <Button 
                onClick={() => openLink(links?.facebook_url)}
                className="h-[45px] border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 flex items-center justify-center p-0 rounded-sm"
              >
                <Facebook className="w-5 h-5 text-[#1877F2]" />
              </Button>
              <Button 
                onClick={() => openLink(links?.youtube_url)}
                className="h-[45px] border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 flex items-center justify-center p-0 rounded-sm"
              >
                <Video className="w-5 h-5 text-[#FF0000]" />
              </Button>
            </div>
          </div>
        </motion.div>

        <div className="mt-12 bg-white border border-[#e1e1e1] p-8 flex items-start space-x-6 text-left">
          <div className="w-12 h-12 shrink-0 bg-green-50 rounded-full flex items-center justify-center">
            <ShieldCheck className="w-7 h-7 text-green-600" />
          </div>
          <div>
            <h4 className="font-bold text-gray-900 leading-tight mb-2">Suporte Certificado Microsoft</h4>
            <p className="text-sm text-gray-500 font-medium leading-relaxed">
              Nossa equipe de suporte está disponível de Segunda a Sábado, das 10h às 22h (Horário de Luanda).
            </p>
          </div>
        </div>

        <div className="mt-16 text-center">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">
            Microsoft Official Support Node
          </p>
        </div>
      </div>
    </div>
  );
}
