import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Filter, Search, MoreHorizontal, CheckCircle2, Clock, AlertCircle, Coins } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '@/src/lib/utils';
import { supabase } from '../lib/supabase';
import { useEffect, useState } from 'react';

interface RechargeRecord {
  id: string;
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  date: string;
  txHash: string;
}

export default function RechargeHistoryUSDT() {
  const navigate = useNavigate();
  const [recharges, setRecharges] = useState<RechargeRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchHistory() {
      try {
        const { data, error } = await supabase
          .from('recharges_usdt_mcpn')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;

        if (data) {
          const mappedData: RechargeRecord[] = data.map(item => ({
            id: item.id,
            amount: Number(item.valor_usdt),
            status: item.status as any,
            date: new Date(item.created_at).toLocaleString('pt-AO'),
            txHash: item.tx_hash
          }));
          setRecharges(mappedData);
        }
      } catch (err: any) {
        console.error('Erro ao buscar histórico USDT:', err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchHistory();
  }, []);

  const totalRecarregado = recharges
    .filter(r => r.status === 'completed')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-50';
      case 'pending': return 'text-amber-600 bg-amber-50';
      case 'failed': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle2 size={14} />;
      case 'pending': return <Clock size={14} />;
      case 'failed': return <AlertCircle size={14} />;
      default: return null;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed': return 'Sucesso';
      case 'pending': return 'Pendente';
      case 'failed': return 'Falhou';
      default: return status;
    }
  };

  return (
    <div className="min-h-screen bg-[#f2f2f2]">
      {/* Header Microsoft Style */}
      <header className="bg-white p-4 flex items-center border-b border-[#d2d2d2] sticky top-0 z-50">
        <button onClick={() => navigate('/recharge-usdt')} className="p-2 -ml-2 text-gray-600 hover:text-ms-blue transition-colors" title="Voltar">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-semibold ml-2 text-gray-900">Histórico USDT</h1>
        <div className="ml-auto flex items-center space-x-2">
          <button className="p-2 text-gray-400 hover:text-ms-blue transition-colors" title="Pesquisar">
            <Search className="w-5 h-5" />
          </button>
          <button className="p-2 text-gray-400 hover:text-ms-blue transition-colors" title="Filtrar">
            <Filter className="w-5 h-5" />
          </button>
        </div>
      </header>

      <div className="p-6 max-w-2xl mx-auto space-y-4">
        {/* Summary Info */}
        <div className="bg-white border-b-2 border-ms-blue p-6 shadow-sm mb-8 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Total Recarregado (USDT)</p>
            <p className="text-3xl font-light text-gray-900">{totalRecarregado.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
          </div>
          <Coins className="w-10 h-10 text-ms-blue opacity-10" />
        </div>

        <div className="space-y-3">
          {loading ? (
            <div className="text-center py-10 text-gray-400">Carregando histórico...</div>
          ) : recharges.length === 0 ? (
            <div className="text-center py-10 text-gray-400">Nenhum registro encontrado.</div>
          ) : (
            recharges.map((record, idx) => (
            <motion.div
              key={record.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="bg-white p-5 border border-[#e1e1e1] hover:shadow-md transition-shadow cursor-pointer relative overflow-hidden flex items-center justify-between group"
            >
              <div className="flex-1 space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{record.id}</span>
                  <div className={cn(
                    "px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider flex items-center space-x-1",
                    getStatusStyle(record.status)
                  )}>
                    {getStatusIcon(record.status)}
                    <span>{getStatusLabel(record.status)}</span>
                  </div>
                </div>
                <div className="flex items-baseline space-x-2">
                  <span className="text-xl font-bold text-gray-900">{record.amount.toFixed(2)}</span>
                  <span className="text-[10px] font-bold text-ms-blue uppercase">USDT</span>
                </div>
                <div className="flex items-center text-[11px] text-gray-500 space-x-3">
                  <span className="flex items-center"><Clock size={12} className="mr-1" /> {record.date}</span>
                  <span className="font-mono text-[10px]">Hash: {record.txHash}</span>
                </div>
              </div>
              <button className="p-2 text-gray-300 hover:text-ms-blue transition-colors" title="Mais opções">
                <MoreHorizontal size={20} />
              </button>
              
              {/* Microsoft-style accent hover */}
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-ms-blue translate-x-[-100%] group-hover:translate-x-0 transition-transform" />
            </motion.div>
          ))
        )}
        </div>

        {/* Empty State / Footer */}
        <div className="text-center py-12 space-y-4">
          <p className="text-xs text-gray-400 font-medium italic">Mostrando os últimos 3 registros de nó seguro Microsoft</p>
          <div className="flex justify-center flex-col items-center opacity-30 mt-10">
              <img 
                src="https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg" 
                className="h-3 grayscale mb-2" 
                alt="MS"
                referrerPolicy="no-referrer"
              />
              <p className="text-[8px] font-bold uppercase tracking-[0.3em]">Official Asset Ledger</p>
          </div>
        </div>
      </div>
    </div>
  );
}
