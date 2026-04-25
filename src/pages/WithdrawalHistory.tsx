import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ReceiptText, Clock, Banknote, ShieldCheck } from 'lucide-react';
import { motion } from 'motion/react';
import { supabase } from '../lib/supabase';
import { cn } from '../lib/utils';
import { EmptyState } from '../components/EmptyState';
import { useLanguage } from '../contexts/LanguageContext';

export default function WithdrawalHistory() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchWithdrawals() {
      try {
        const { data, error } = await supabase.rpc('get_my_withdrawals_mcpn');

        if (error) throw error;
        if (data) setHistory(data);
      } catch (err: any) {
        console.error('Erro ao buscar retiradas:', err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchWithdrawals();
  }, []);

  const calculateReceivedAmount = (amount: number, taxRate: number) => {
    return amount - (amount * taxRate);
  };

  const calculateEstimatePayment = (dateStr: string) => {
    const date = new Date(dateStr);
    const estimate = new Date(date);
    estimate.setHours(estimate.getHours() + 24);
    return estimate;
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pt-AO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatFullDate = (dateStr: string | Date) => {
    const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
    return date.toLocaleString('pt-AO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-[#f2f2f2] pb-20">
      <header className="bg-white p-4 flex items-center border-b border-[#e1e1e1]">
        <button onClick={() => navigate('/retirada')} className="p-2 -ml-2 text-[#616161]" title={t('common.back')}>
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="text-sm font-semibold ml-2 text-[#2b2b2b]">{t('withdraw.history_title')}</h1>
      </header>

      <div className="p-6 max-w-lg mx-auto space-y-6">
        <div className="mb-8">
          <h2 className="text-2xl font-light text-[#2b2b2b]">{t('withdraw.history_title')}</h2>
          <p className="text-xs text-[#616161] mt-1">{t('withdraw.history_desc')}</p>
        </div>

        {loading ? (
          <div className="text-center py-20 text-gray-400 italic">{t('common.loading')}</div>
        ) : history.map((item) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white border border-[#e1e1e1] shadow-sm rounded-sm overflow-hidden"
          >
            <div className="p-5 space-y-4">
              <div className="flex justify-between items-start border-b border-[#f3f3f3] pb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-[#f2f2f2] rounded text-[#616161]">
                    <Banknote size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#2b2b2b]">{item.banco_nome}</p>
                    <p className="text-[10px] text-gray-400 font-mono">**** **** ****</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={cn(
                    "text-[10px] font-bold uppercase tracking-wider",
                    item.status === 'pendente' ? "text-[#a66d00]" : 
                    item.status === 'sucesso' ? "text-green-600" : "text-red-500"
                  )}>
                    {item.status === 'pendente' ? t('history.pending') : item.status === 'sucesso' ? t('history.completed') : t('history.failed')}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">{t('withdraw.gross_amount')}</p>
                      <p className="text-sm text-[#2b2b2b]">{Number(item.valor_solicitado).toLocaleString()} Kz</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">{t('withdraw.net_amount')}</p>
                      <p className="text-sm font-bold text-ms-blue">{Number(item.valor_receber).toLocaleString()} Kz</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">{t('withdraw.req_date')}</p>
                    <p className="text-sm text-[#2b2b2b]">{formatFullDate(item.created_at)}</p>
                  </div>

                  {item.status === 'pendente' && (
                    <div className="bg-[#fff8f0] p-3 rounded-sm border border-[#ffebcc] flex items-start space-x-3">
                      <Clock size={16} className="text-[#a66d00] mt-0.5 shrink-0" />
                      <div>
                        <p className="text-[10px] font-bold text-[#a66d00] uppercase tracking-widest leading-none mb-1">{t('withdraw.est_payment')}</p>
                        <p className="text-xs text-[#a66d00] font-medium">{t('withdraw.until')} {formatFullDate(calculateEstimatePayment(item.created_at)).split(',')[1]}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="bg-[#f9f9f9] px-5 py-2 border-t border-[#f3f3f3] flex justify-between items-center text-[9px] text-gray-400 font-bold uppercase tracking-[0.2em]">
              <span>ID: {item.id.toString().substring(0, 8)}</span>
              <ShieldCheck size={12} className="text-[#107c10]" />
            </div>
          </motion.div>
        ))}
        
        {history.length === 0 && !loading && (
          <EmptyState 
            message="Nenhum registro encontrado"
            description={t('withdraw.empty')}
          />
        )}
      </div>
    </div>
  );
}
