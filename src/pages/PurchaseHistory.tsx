import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ReceiptText, Laptop, Server, Cpu, ExternalLink, Download } from 'lucide-react';
import { motion } from 'motion/react';
import { supabase } from '../lib/supabase';
import { useEffect, useState } from 'react';
import { cn } from '../lib/utils';

export default function PurchaseHistory() {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const [purchases, setPurchases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPurchases() {
      try {
        const { data, error } = await supabase.rpc('get_my_purchased_products_mcpn');

        if (error) throw error;
        if (data) setPurchases(data);
      } catch (err: any) {
        console.error('Erro ao buscar compras:', err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchPurchases();
  }, []);

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString(
      language === 'en' ? 'en-US' : language === 'fr' ? 'fr-FR' : 'pt-AO'
    );
  };

  return (
    <div className="min-h-screen bg-ms-bg pb-20">
      <header className="bg-white p-4 flex items-center border-b border-[#d2d2d2] sticky top-0 z-10">
        <button onClick={() => navigate('/perfil')} className="p-2 -ml-2 text-gray-600" title={t('common.back')}>
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-semibold ml-2 text-gray-900">{t('history.title')}</h1>
      </header>

      <div className="p-4 max-w-2xl mx-auto space-y-4">
        {loading ? (
          <div className="text-center py-20 text-gray-400">{t('history.loading')}</div>
        ) : purchases.length === 0 ? (
          <div className="text-center py-20 text-gray-400">{t('history.empty')}</div>
        ) : purchases.map((item, idx) => (
          <motion.div 
            key={item.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="ms-card p-0 overflow-hidden bg-white border border-[#e1e1e1] shadow-sm flex flex-col"
          >
            {/* Microsoft Header Style for each item */}
            <div className="bg-[#f2f2f2] px-4 py-2 flex justify-between items-center border-b border-[#e1e1e1] text-[10px] font-bold text-gray-500 uppercase tracking-tight">
              <span>{t('history.license_id')}: {item.id.toString().substring(0, 8).toUpperCase()}</span>
              <span>{t('history.activated_at')}: {formatDate(item.data_inicio)}</span>
            </div>

            <div className="p-4 flex space-x-6 items-start">
              {/* Product Image */}
              <div className="w-20 h-20 shrink-0 overflow-hidden border border-[#f2f2f2] bg-[#fbfbfb] flex items-center justify-center">
                <img 
                  src={item.produto_imagem} 
                  className="w-full h-full object-cover mix-blend-multiply opacity-80" 
                  alt={item.produto_nome}
                  referrerPolicy="no-referrer"
                />
              </div>

              {/* Product Info */}
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-bold text-gray-900 mb-1">{item.produto_nome}</h3>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-3 gap-x-6 mb-4">
                  <div className="space-y-0.5">
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">{t('history.investment')}</p>
                    <p className="text-xs font-bold text-gray-900 leading-none">{Number(item.preco_pago).toLocaleString()},00 Kz</p>
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">{t('history.status')}</p>
                    <p className={cn(
                      "text-xs font-bold leading-none",
                      item.ativo ? "text-green-600" : "text-red-500"
                    )}>
                      {item.ativo ? t('history.status_active') : t('history.status_expired')}
                    </p>
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">{t('history.remaining')}</p>
                    <p className="text-xs font-bold text-ms-blue leading-none">{item.dias_restantes} {item.dias_restantes === 1 ? t('product.unit.day') : t('product.unit.days')}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <button 
                    onClick={() => alert(`${t('history.manage_server')}: ${item.produto_nome}`)}
                    className="text-ms-blue text-[10px] font-bold uppercase tracking-wider hover:underline flex items-center"
                  >
                    <ExternalLink className="w-3 h-3 mr-1" />
                    {t('history.manage_server')}
                  </button>
                  <span className="text-gray-200">|</span>
                  <div className="flex items-center text-gray-400 text-[10px] font-bold uppercase tracking-wider">
                    <Download className="w-3 h-3 mr-1" />
                    {t('history.backup_iso')}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}

        <div className="text-center py-6 opacity-30 mt-4 border-t border-gray-300 max-w-xs mx-auto">
          <img 
            src="https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg"
            alt="MS" 
            className="h-3.5 mx-auto"
            referrerPolicy="no-referrer"
          />
        </div>
      </div>
    </div>
  );
}
