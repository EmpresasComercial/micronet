import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ReceiptText, Clock, Landmark } from 'lucide-react';
import { motion } from 'motion/react';
import { supabase } from '../lib/supabase';
import { cn } from '../lib/utils';
import { useToast } from '../components/Toast';

export default function RechargeHistory() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchHistory() {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('recargas_mcpn')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        if (data) setHistory(data);
      } catch (err: any) {
        showToast('Erro ao carregar histórico de recargas.', 'error');
        console.error('Erro:', err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchHistory();
  }, []);

  const formatFullDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('pt-AO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusStyle = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmado':
      case 'sucesso':
        return 'text-green-600 bg-green-50 border-green-100';
      case 'rejeitado':
      case 'falha':
        return 'text-red-600 bg-red-50 border-red-100';
      default:
        return 'text-ms-blue bg-blue-50 border-blue-100';
    }
  };

  return (
    <div className="min-h-screen bg-[#f2f2f2] pb-20">
      <header className="bg-white p-4 flex items-center border-b border-[#e1e1e1] sticky top-0 z-50">
        <button onClick={() => navigate('/recarregar')} className="p-2 -ml-2 text-gray-600" title="Voltar">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="text-sm font-semibold ml-2 text-[#2b2b2b]">Histórico de Recargas</h1>
      </header>

      <div className="p-6 max-w-lg mx-auto">
        <div className="mb-8">
          <h2 className="text-3xl font-light text-[#2b2b2b]">Meus Depósitos</h2>
          <p className="text-sm text-[#616161] mt-2">Acompanhe o status de validação das suas recargas bancárias.</p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <div className="w-8 h-8 border-4 border-ms-blue border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Sincronizando com Servidor...</p>
          </div>
        ) : history.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20 bg-white border border-dashed border-gray-200 rounded-sm"
          >
            <ReceiptText className="mx-auto w-12 h-12 text-gray-100 mb-4" />
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Nenhum registro encontrado</p>
            <button 
              onClick={() => navigate('/recarregar')}
              className="mt-6 text-ms-blue text-sm font-bold hover:underline"
            >
              Fazer minha primeira recarga
            </button>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {history.map((item, idx) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-white border border-[#e1e1e1] shadow-sm rounded-sm overflow-hidden"
              >
                <div className="p-5">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-[#f2f2f2] rounded-sm flex items-center justify-center text-gray-500">
                        <Landmark size={20} />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-900 uppercase truncate max-w-[150px]">
                          {item.banco_origem || 'Depósito Bancário'}
                        </p>
                        <p className="text-[10px] text-gray-400 font-medium">
                          {formatFullDate(item.created_at)}
                        </p>
                      </div>
                    </div>
                    <div className={cn(
                      "px-2 py-1 rounded-[2px] border text-[9px] font-bold uppercase tracking-wider",
                      getStatusStyle(item.status)
                    )}>
                      {item.status === 'pendente' ? 'Em Análise' : item.status}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6 py-4 border-y border-gray-50">
                    <div>
                      <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Montante</p>
                      <p className="text-lg font-light text-ms-blue leading-none">
                        {Number(item.valor).toLocaleString()},00 <span className="text-[10px] font-bold">Kz</span>
                      </p>
                    </div>
                    <div>
                      <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Ref. Transação</p>
                      <p className="text-xs font-mono font-bold text-gray-700 truncate">
                        {item.id.toString().substring(0, 13).toUpperCase()}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-end">
                    <div className="flex items-center text-[9px] text-gray-400 font-bold uppercase">
                      <Clock size={12} className="mr-1" /> SLA de Aprovação: 24h
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
        
        <div className="mt-12 text-center opacity-30">
          <img 
            src="https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg" 
            alt="MS" 
            className="h-3.5 mx-auto grayscale"
            referrerPolicy="no-referrer"
          />
          <p className="text-[8px] font-bold uppercase tracking-[0.3em] mt-2">Verified Billing Node</p>
        </div>
      </div>
    </div>
  );
}
