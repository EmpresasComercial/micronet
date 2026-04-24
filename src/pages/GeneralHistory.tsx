import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronDown, History, Search, Filter, ArrowUpRight, ArrowDownLeft, TrendingUp, Users, Award, ReceiptText, Ticket } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/src/lib/utils';
import { supabase } from '../lib/supabase';
import { useEffect } from 'react';

type HistoryType = 'recargas' | 'retiradas' | 'renda_diaria' | 'bonus_equipe' | 'bonus_gerente' | 'cupom' | '';

interface HistoryItem {
  id: string;
  type: HistoryType;
  amount: number;
  date: string;
  description: string;
  status: 'completed' | 'pending' | 'failed';
}

export default function GeneralHistory() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<HistoryType>('');
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchHistory() {
      setLoading(true);
      try {
        const { data, error } = await supabase.rpc('get_general_history_mcpn');

        if (error) throw error;

        if (data) {
          const mapped: HistoryItem[] = data.map(item => ({
            id: item.id,
            type: item.type as any,
            amount: Number(item.amount),
            date: new Date(item.created_at).toLocaleString('pt-AO'),
            description: item.description,
            status: item.status as any
          }));
          setHistory(mapped);
        }
      } catch (err: any) {
        console.error('Erro ao carregar histórico geral:', err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchHistory();
  }, []);

  const filteredData = history.filter(item => !filter || item.type === filter);

  const getIcon = (type: HistoryType) => {
    switch (type) {
      case 'recargas': return ArrowDownLeft;
      case 'retiradas': return ArrowUpRight;
      case 'renda_diaria': return TrendingUp;
      case 'bonus_equipe': return Users;
      case 'bonus_gerente': return Award;
      case 'cupom': return Ticket;
      default: return History;
    }
  };

  const getLabel = (type: HistoryType) => {
    const labels: Record<HistoryType, string> = {
      'recargas': 'Recargas',
      'retiradas': 'Retiradas',
      'renda_diaria': 'Renda Diária',
      'bonus_equipe': 'Bônus de Equipe',
      'bonus_gerente': 'Bônus de Gerente',
      'cupom': 'Resgate de Cupons',
      '': ''
    };
    return labels[type];
  };

  return (
    <div className="min-h-screen bg-ms-bg pb-20">
      <header className="bg-white p-4 flex items-center sticky top-0 z-50 border-b border-[#d2d2d2]">
        <button onClick={() => navigate('/perfil')} className="p-2 -ml-2 text-gray-600" title="Voltar">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-semibold ml-2 text-gray-900">Histórico de Atividades</h1>
      </header>

      <div className="p-6 max-w-2xl mx-auto space-y-6">
        {/* Filter Selector (Style from MS Settings) */}
        <div className="bg-white border border-[#e1e1e1] p-8 shadow-sm">
          <h2 className="text-xl font-light text-gray-900 mb-6">Filtrar Atividades</h2>
          <div className="space-y-4">
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-[0.1em]">Tipo de Transação</label>
            <div className="relative">
              <select 
                className="w-full border-b border-[#666] py-2 focus:border-b-2 focus:border-ms-blue outline-none bg-transparent font-medium text-gray-700 appearance-none cursor-pointer"
                value={filter}
                onChange={(e) => setFilter(e.target.value as HistoryType)}
                title="Selecionar tipo de transação"
              >
                <option value="">Apresentar todos os tipos</option>
                <option value="recargas">Recargas de Fundo</option>
                <option value="retiradas">Retiradas de Capital</option>
                <option value="renda_diaria">Rendimento de Operação</option>
                <option value="bonus_equipe">Comissão de Rede</option>
                <option value="bonus_gerente">Bônus de Liderança</option>
                <option value="cupom">Resgate de Cupons</option>
              </select>
              <ChevronDown className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {!filter ? (
            <motion.div 
              key="empty"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-24 text-center space-y-6"
            >
              <div className="w-20 h-20 bg-white shadow-sm border border-gray-100 rounded-sm flex items-center justify-center text-gray-200">
                <History size={40} strokeWidth={1} />
              </div>
              <div className="space-y-1">
                <p className="text-lg font-light text-gray-900">Selecione uma categoria acima</p>
                <p className="text-xs text-gray-400 uppercase tracking-widest font-bold">Por favor, escolha o histórico que deseja verificar</p>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center space-x-2">
                  <div className="w-1 h-3 bg-ms-blue" />
                  <h3 className="text-xs font-bold text-gray-900 uppercase tracking-[0.15em]">{getLabel(filter)}</h3>
                </div>
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Atividades Recentes</span>
              </div>

              <div className="bg-white border border-[#e1e1e1] shadow-sm divide-y divide-[#f2f2f2]">
                {loading ? (
                   <div className="text-center py-20 px-6">
                    <p className="text-sm text-gray-400 italic">Buscando atividades...</p>
                  </div>
                ) : filteredData.length > 0 ? (
                  filteredData.map((item, idx) => {
                    const Icon = getIcon(item.type);
                    return (
                      <motion.div 
                        key={item.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: idx * 0.03 }}
                        className="p-5 flex items-center justify-between hover:bg-[#f9f9f9] transition-colors cursor-default"
                      >
                        <div className="flex items-center space-x-5">
                          <div className={cn(
                            "w-10 h-10 rounded-[2px] flex items-center justify-center shadow-sm border border-black/5",
                            item.type === 'retiradas' ? "bg-red-50 text-red-500" : "bg-green-50 text-green-500"
                          )}>
                            <Icon size={18} strokeWidth={2} />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-[#2b2b2b] leading-tight">{item.description}</p>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-1">{item.date}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={cn(
                            "text-lg font-light leading-none",
                            item.type === 'retiradas' ? "text-red-600" : "text-green-600"
                          )}>
                            {item.type === 'retiradas' ? '-' : '+'}{item.amount.toLocaleString()}{filter === 'recargas' && item.description.includes('USDT') ? '' : ',00 Kz'}
                          </p>
                          <p className={cn(
                            "text-[9px] font-bold uppercase tracking-[0.2em] mt-2",
                            item.status === 'completed' ? "text-green-600" : 
                            item.status === 'pending' ? "text-amber-500" : "text-red-500"
                          )}>
                            {item.status === 'completed' ? 'Aprovado' : item.status === 'pending' ? 'Em Análise' : 'Cancelado'}
                          </p>
                        </div>
                      </motion.div>
                    );
                  })
                ) : (
                  <div className="text-center py-20 px-6">
                    <p className="text-sm text-gray-400 italic">Não foram encontradas atividades recentes para esta categoria.</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Brand Footer */}
        <div className="pt-10 flex flex-col items-center opacity-20">
          <img 
            src="https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg" 
            alt="MS" 
            className="h-3 mb-2 grayscale"
            referrerPolicy="no-referrer"
          />
          <p className="text-[8px] font-bold uppercase tracking-[0.4em]">Audit Logging System</p>
        </div>
      </div>
    </div>
  );
}
