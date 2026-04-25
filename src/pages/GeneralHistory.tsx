import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronDown, History, ArrowUpRight, ArrowDownLeft, TrendingUp, Users, Award, Ticket, Filter, LayoutGrid } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';
import { supabase } from '../lib/supabase';
import { useToast } from '../components/Toast';

type HistoryType = 'recargas' | 'retiradas' | 'renda_diaria' | 'bonus_equipe' | 'cupom' | '';

interface HistoryItem {
  id: string;
  type: HistoryType;
  amount: number;
  date: string;
  description: string;
  status: 'completed' | 'pending' | 'failed' | 'confirmado' | 'pendente' | 'rejeitado';
}

export default function GeneralHistory() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [filter, setFilter] = useState<HistoryType>('');
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchHistory() {
      setLoading(true);
      try {
        const { data, error } = await supabase.rpc('get_general_history_mcpn');

        if (error) throw error;

        if (data) {
          const mapped: HistoryItem[] = data.map((item: any) => ({
            id: item.id,
            type: item.type as any,
            amount: Number(item.amount),
            date: new Date(item.created_at).toLocaleString('pt-AO', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            }),
            description: item.description,
            status: item.status as any
          }));
          setHistory(mapped);
        }
      } catch (err: any) {
        showToast('Falha ao sincronizar histórico.', 'error');
        console.error('Erro:', err.message);
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
      case 'cupom': return Ticket;
      default: return History;
    }
  };

  const getStatusStyle = (status: string) => {
    const s = status.toLowerCase();
    if (s === 'completed' || s === 'confirmado' || s === 'aprovado') return 'text-green-600 bg-green-50 border-green-100';
    if (s === 'pending' || s === 'pendente') return 'text-ms-blue bg-blue-50 border-blue-100';
    return 'text-red-600 bg-red-50 border-red-100';
  };

  const getStatusLabel = (status: string) => {
    const s = status.toLowerCase();
    if (s === 'completed' || s === 'confirmado' || s === 'aprovado') return 'Concluído';
    if (s === 'pending' || s === 'pendente') return 'Em Análise';
    return 'Falhou';
  };

  return (
    <div className="min-h-screen bg-[#f2f2f2] pb-20">
      <header className="bg-white p-4 flex items-center sticky top-0 z-50 border-b border-[#e1e1e1]">
        <button onClick={() => navigate('/perfil')} className="p-2 -ml-2 text-gray-600" title="Voltar">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="text-sm font-semibold ml-2 text-[#2b2b2b]">Histórico de Atividades</h1>
      </header>

      <div className="p-6 max-w-lg mx-auto space-y-6">
        <div className="mb-8">
          <h2 className="text-3xl font-light text-[#2b2b2b]">Atividades</h2>
          <p className="text-sm text-[#616161] mt-2">Registro completo de suas operações financeiras na nuvem.</p>
        </div>

        <div className="bg-white border border-[#e1e1e1] p-6 shadow-sm rounded-sm">
          <div className="flex items-center space-x-2 mb-4">
            <Filter size={14} className="text-ms-blue" />
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Filtrar Categoria</p>
          </div>
          <div className="relative">
            <select 
              className="w-full bg-[#fbfbfb] border border-gray-100 py-3 px-4 rounded-sm outline-none font-bold text-xs text-gray-700 appearance-none cursor-pointer hover:bg-gray-50 transition-colors"
              value={filter}
              onChange={(e) => setFilter(e.target.value as HistoryType)}
              title="Filtrar por tipo"
            >
              <option value="">Apresentar Tudo (Visão Geral)</option>
              <option value="recargas">Recargas de Saldo</option>
              <option value="retiradas">Levantamentos</option>
              <option value="renda_diaria">Rendimentos Diários</option>
              <option value="bonus_equipe">Comissões & Bónus de Equipe</option>
              <option value="cupom">Resgate de Cupons</option>
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-ms-blue pointer-events-none" />
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center space-x-2">
              <LayoutGrid size={14} className="text-ms-blue" />
              <h3 className="text-[10px] font-bold text-gray-900 uppercase tracking-widest">
                {filter ? `Filtrado: ${filter}` : 'Lista Completa'}
              </h3>
            </div>
            <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">Tempo Real</span>
          </div>

          <div className="space-y-3">
            {loading ? (
              <div className="bg-white border border-[#e1e1e1] p-12 flex flex-col items-center justify-center rounded-sm">
                <div className="w-6 h-6 border-2 border-ms-blue border-t-transparent rounded-full animate-spin mb-4" />
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Sincronizando Atividades...</p>
              </div>
            ) : filteredData.length > 0 ? (
              filteredData.map((item, idx) => {
                const Icon = getIcon(item.type);
                return (
                  <motion.div 
                    key={item.id}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.02 }}
                    className="bg-white border border-[#e1e1e1] p-5 rounded-sm shadow-sm flex items-center justify-between group"
                  >
                    <div className="flex items-center space-x-4">
                      <div className={cn(
                        "w-10 h-10 rounded-sm flex items-center justify-center border transition-colors",
                        item.type === 'retiradas' ? "bg-red-50 border-red-100 text-red-500" : "bg-blue-50 border-blue-100 text-ms-blue"
                      )}>
                        <Icon size={20} strokeWidth={1.5} />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-800 uppercase tracking-tight leading-tight mb-1 group-hover:text-ms-blue transition-colors">
                          {item.description}
                        </p>
                        <p className="text-[10px] text-gray-400 font-medium">{item.date}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={cn(
                        "text-base font-light tracking-tight",
                        item.type === 'retiradas' ? "text-red-600" : "text-green-600"
                      )}>
                        {item.type === 'retiradas' ? '-' : '+'}{item.amount.toLocaleString()},00 <span className="text-[9px] font-bold">Kz</span>
                      </p>
                      <div className={cn(
                        "inline-block px-1.5 py-0.5 rounded-[2px] border text-[8px] font-black uppercase tracking-widest mt-2",
                        getStatusStyle(item.status)
                      )}>
                        {getStatusLabel(item.status)}
                      </div>
                    </div>
                  </motion.div>
                );
              })
            ) : (
              <div className="bg-white border border-dashed border-gray-200 p-16 flex flex-col items-center justify-center rounded-sm text-center">
                <History size={32} className="text-gray-100 mb-4" />
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest leading-relaxed">
                  Nenhuma atividade registrada<br/>nesta categoria.
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="pt-12 flex flex-col items-center opacity-20 pointer-events-none">
          <img 
            src="https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg" 
            alt="MS" 
            className="h-3 mb-2 grayscale"
            referrerPolicy="no-referrer"
          />
          <p className="text-[8px] font-bold uppercase tracking-[0.4em]">Integrated Audit System</p>
        </div>
      </div>
    </div>
  );
}
