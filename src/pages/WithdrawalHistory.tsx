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
    <div className="min-h-screen bg-[#f8f9fa] pb-20">
      <header className="bg-white px-[4px] h-14 flex items-center justify-between sticky top-0 z-50 border-b border-gray-100">
        <div className="flex items-center">
          <button 
            onClick={() => navigate('/retirada')} 
            className="p-3 text-gray-800"
            title="Voltar"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-black text-gray-900 tracking-tight ml-1">{t('withdraw.history_title')}</h1>
        </div>
        <div className="px-4">
           <ReceiptText size={18} className="text-ms-blue" />
        </div>
      </header>

      <div className="px-[4px] py-4 space-y-[4px]">
        {loading ? (
          <div className="text-center py-20 text-gray-400 italic font-bold uppercase tracking-widest">{t('common.loading')}</div>
        ) : history.map((item) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white border border-gray-100 p-5 space-y-4"
          >
            <div className="flex justify-between items-start border-b border-gray-50 pb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gray-50 flex items-center justify-center">
                  <Banknote size={20} className="text-gray-400" />
                </div>
                <div>
                  <p className="text-sm font-black text-gray-900 tracking-tight">{item.banco_nome || t('withdraw.bank_acc')}</p>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{t('withdraw.via_iban')}</p>
                </div>
              </div>
              <div className="text-right">
                <span className={cn(
                  "text-[10px] font-black uppercase tracking-widest px-2 py-1",
                  item.status === 'pendente' ? "text-orange-500 bg-orange-50" : 
                  item.status === 'sucesso' ? "text-green-600 bg-green-50" : "text-red-500 bg-red-50"
                )}>
                  {item.status}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[10px] font-black text-gray-400 tracking-widest uppercase mb-1">{t('withdraw.gross_amount')}</p>
                <p className="text-sm font-bold text-gray-700">{Number(item.valor_solicitado).toLocaleString()} Kz</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black text-gray-400 tracking-widest uppercase mb-1">{t('withdraw.net_amount')}</p>
                <p className="text-sm font-black text-ms-blue">{Number(item.valor_receber).toLocaleString()} Kz</p>
              </div>
            </div>

            <div className="flex justify-between items-center text-[10px] pt-2">
               <span className="text-gray-400 font-medium">{t('withdraw.requested_at')} {formatFullDate(item.created_at)}</span>
               {item.status === 'pendente' && (
                 <div className="flex items-center text-orange-500 font-bold">
                   <Clock size={12} className="mr-1" />
                   <span>{t('history.pending')}</span>
                 </div>
               )}
            </div>
          </motion.div>
        ))}
        
        {history.length === 0 && !loading && (
          <div className="bg-white p-20 text-center border border-gray-100">
             <ReceiptText size={48} className="mx-auto text-gray-200 mb-4" />
             <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">{t('withdraw.empty')}</p>
          </div>
        )}
      </div>
    </div>
  );
}
