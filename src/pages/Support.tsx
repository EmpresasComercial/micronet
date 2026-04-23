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
          className="ms-card p-8 space-y-6"
        >
          <div className="flex items-center space-x-3 mb-4">
            <Headphones className="w-10 h-10 text-ms-blue opacity-20" />
            <img 
              src="https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg" 
              alt="Microsoft" 
              className="h-5"
              referrerPolicy="no-referrer"
            />
          </div>

          <div className="space-y-4">
            {/* WhatsApp Gerente */}
            <Button
              onClick={() => openLink(links?.whatsapp_gerente_url)}
              className="w-full flex flex-col items-start space-y-1 py-6 h-auto text-left"
              variant="primary"
            >
              <div className="flex items-center space-x-3 w-full">
                <MessageCircle className="w-5 h-5" />
                <span className="font-bold">Atendimento VIP (WhatsApp)</span>
              </div>
              <span className="text-[10px] opacity-70 ml-8 block">Fale diretamente com seu gerente de conta Microsoft.</span>
            </Button>

            {/* Grupo de Vendas */}
            <Button
              onClick={() => openLink(links?.whatsapp_grupo_vendas_url)}
              className="w-full flex flex-col items-start space-y-1 py-6 h-auto text-left"
              variant="outline"
            >
              <div className="flex items-center space-x-3 w-full">
                <Users className="w-5 h-5" />
                <span className="font-bold">Grupo de Vendas Oficiais</span>
              </div>
              <span className="text-[10px] opacity-70 ml-8 block">Participe da comunidade e receba bônus diários.</span>
            </Button>

            {/* Telegram */}
            <Button
              onClick={() => openLink(links?.telegram_url)}
              className="w-full flex flex-col items-start space-y-1 py-6 h-auto text-left"
              variant="outline"
            >
              <div className="flex items-center space-x-3 w-full">
                <Send className="w-5 h-5" />
                <span className="font-bold">Canal Oficial Telegram</span>
              </div>
              <span className="text-[10px] opacity-70 ml-8 block">Notificações em tempo real sobre o Cloud Node.</span>
            </Button>

            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => openLink(links?.facebook_url)}
                className="flex items-center justify-center p-3 border border-gray-200 rounded hover:bg-gray-50 transition-colors"
                aria-label="Acesse nossa página no Facebook"
                title="Facebook"
              >
                <Facebook className="w-5 h-5 text-[#1877F2]" />
              </button>
              <button 
                onClick={() => openLink(links?.youtube_url)}
                className="flex items-center justify-center p-3 border border-gray-200 rounded hover:bg-gray-50 transition-colors"
                aria-label="Acesse nosso canal no YouTube"
                title="YouTube"
              >
                <Video className="w-5 h-5 text-[#FF0000]" />
              </button>
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
              Nossa equipe de suporte está disponível de Segunda a Sábado, das 08h às 18h (Horário de Luanda).
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
