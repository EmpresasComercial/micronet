import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ReceiptText, Clock, CreditCard, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { supabase } from '../lib/supabase';
import { useEffect, useState } from 'react';

export default function RechargeHistory() {
  const navigate = useNavigate();
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchHistory() {
      try {
        const { data, error } = await supabase
          .from('recargas_mcpn')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        if (data) setHistory(data);
      } catch (err: any) {
        console.error('Erro ao buscar recargas:', err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchHistory();
  }, []);

  const calculateEstimateApproval = (dateStr: string) => {
    const date = new Date(dateStr);
    const estimate = new Date(date);
    estimate.setMinutes(estimate.getMinutes() + 60);
    return estimate;
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
        <button onClick={() => navigate('/recarregar')} className="p-2 -ml-2 text-[#616161]" title="Voltar">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="text-sm font-semibold ml-2 text-[#2b2b2b]">Registro de recarga</h1>
      </header>

      <div className="p-6 max-w-lg mx-auto space-y-6">
        <div className="mb-8">
          <h2 className="text-2xl font-light text-[#2b2b2b]">Histórico de recargas</h2>
          <p className="text-xs text-[#616161] mt-1">Visualize suas solicitações de depósito e status de aprovação.</p>
        </div>

        {loading ? (
          <div className="text-center py-20 text-gray-400 italic">Carregando seus registros...</div>
        ) : history.map((item) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white border border-[#e1e1e1] shadow-sm rounded-sm"
          >
            <div className="p-5 space-y-4">
              {/* Header */}
              <div className="flex justify-between items-center border-b border-[#f3f3f3] pb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-[#f2f2f2] rounded text-[#616161]">
                    <CreditCard size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#2b2b2b]">Recarga via {item.banco_origem}</p>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Depósito Bancário</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className={cn(
                    "flex items-center text-[10px] font-bold uppercase tracking-widest leading-none mb-1",
                    item.status === 'pendente' ? "text-[#d83b01]" : 
                    item.status === 'confirmado' ? "text-green-600" : "text-red-500"
                  )}>
                    <Clock size={10} className="mr-1" /> {item.status === 'pendente' ? 'Em Análise' : item.status}
                  </div>
                </div>
              </div>

              {/* Grid content */}
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">Valor Solicitado</p>
                    <p className="text-lg font-bold text-[#2b2b2b]">{Number(item.valor).toLocaleString()},00 Kz</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">Chave Transação</p>
                    <p className="text-sm font-black text-ms-blue tracking-wider">{item.chave_transacao}</p>
                  </div>
                </div>

                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">Data de Solicitação</p>
                  <p className="text-sm text-[#2b2b2b]">{formatFullDate(item.created_at)}</p>
                </div>

                {item.status === 'pendente' && (
                  <div className="bg-[#f3f9f3] p-3 rounded-sm border border-[#dff6dd] flex items-start space-x-3">
                    <CheckCircle2 size={16} className="text-[#107c10] mt-0.5 shrink-0" />
                    <div>
                      <p className="text-[10px] font-bold text-[#107c10] uppercase tracking-widest leading-none mb-1">Previsão de Aprovação</p>
                      <p className="text-xs text-[#107c10] font-medium">Até as {formatFullDate(calculateEstimateApproval(item.created_at)).split(',')[1]}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-[#f9f9f9] px-5 py-2 border-t border-[#f3f3f3] flex justify-between items-center text-[9px] text-gray-400 font-bold uppercase tracking-[0.2em]">
              <span>MS Billing System</span>
              <div className="flex items-center">
                <AlertCircle size={10} className="mr-1" /> ID: {item.id.toString().substring(0, 8)}
              </div>
            </div>
          </motion.div>
        ))}

        {history.length === 0 && !loading && (
          <div className="text-center py-20 bg-white border border-dashed border-gray-200 rounded-sm">
            <ReceiptText className="mx-auto w-12 h-12 text-gray-200 mb-4" />
            <p className="text-sm text-gray-400">Nenhum registro de recarga encontrado.</p>
          </div>
        )}
      </div>
    </div>
  );
}
