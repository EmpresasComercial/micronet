import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Cpu, Activity, Zap, CheckCircle2, Cloud } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '@/src/lib/utils';
import { Button } from '../components/Button';
import { useToast } from '../components/Toast';
import { useLanguage } from '../contexts/LanguageContext';
import { supabase } from '../lib/supabase';
import { products } from '../constants/products';

export default function Operations() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { t } = useLanguage();
  const [isOperating, setIsOperating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [estimatedIncome, setEstimatedIncome] = useState(0);
  const [hasServers, setHasServers] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkStatus() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Buscar produtos do usuário
        const { data: userProds, error: pError } = await supabase
          .from('user_produtos')
          .select('*')
          .eq('user_id', user.id);

        if (pError) throw pError;
        
        if (userProds && userProds.length > 0) {
          // Filtrar os ativos e mapear para os detalhes do produto estático
          const activeProds = userProds.filter((p: any) => {
            const hasDays = (p.dias_restantes === undefined || p.dias_restantes > 0);
            const isActive = (p.ativo === undefined || p.ativo === true);
            return hasDays && isActive;
          });
          
          if (activeProds.length > 0) {
            let total = 0;
            activeProds.forEach((up: any) => {
              const baseProd = products.find(p => p.id === up.produto_id.toString());
              if (baseProd) {
                // A renda diária é 5% do valor do produto conforme o ProductCard
                total += (baseProd.priceValue * 0.05);
              }
            });
            
            setEstimatedIncome(total);
            setHasServers(true);
          }
        }

        // Check if already collected today (Luanda Time)
        // We compare against the date string in Africa/Luanda timezone
        const now = new Date();
        const todayStr = now.toLocaleDateString('sv-SE', { timeZone: 'Africa/Luanda' }); // YYYY-MM-DD
        
        const { data: collected, error: cError } = await supabase
          .from('renda_diaria_mcpn')
          .select('id')
          .eq('user_id', user.id)
          .gte('created_at', `${todayStr}T00:00:00Z`)
          .lte('created_at', `${todayStr}T23:59:59Z`)
          .limit(1);

        if (cError) throw cError;
        if (collected && collected.length > 0) {
          setIsCompleted(true);
          setProgress(100);
        }
      } catch (err: any) {
        console.error('Erro ao checar status:', err.message);
      } finally {
        setLoading(false);
      }
    }
    checkStatus();
  }, []);

  const startTask = async () => {
    if (isCompleted || !hasServers) {
      if (!hasServers) showToast('Você não tem servidores ativos para coletar rendimentos.', 'error');
      return;
    }
    
    setIsOperating(true);
    setProgress(0);

    // Simulação visual de sincronização com o nó Microsoft
    const duration = 2500;
    const interval = 50;
    const steps = duration / interval;
    const increment = 100 / steps;
    
    let currentProgress = 0;
    const timer = setInterval(async () => {
      currentProgress += increment;
      if (currentProgress >= 100) {
        setProgress(100);
        clearInterval(timer);
        
        // Chamada real ao banco após animação
        try {
          const { data, error } = await supabase.rpc('collect_daily_earnings');
          
          if (error) throw error;
          
          if (data?.success) {
            setIsCompleted(true);
            setIsOperating(false);
            showToast(data.message || 'Rendimentos coletados com sucesso!', 'success');
          } else {
            setIsOperating(false);
            setProgress(0);
            showToast(data?.message || 'Erro ao coletar rendimentos.', 'error');
          }
        } catch (err: any) {
          setIsOperating(false);
          setProgress(0);
          showToast(err.message || 'Falha na conexão com o nó operacional.', 'error');
        }
      } else {
        setProgress(Math.floor(currentProgress));
      }
    }, interval);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f2f2f2]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0067b8]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f2f2f2] pb-20 font-sans">
      <header className="bg-white p-4 flex items-center border-b border-[#e1e1e1] sticky top-0 z-50">
        <button 
          onClick={() => navigate('/perfil')} 
          className="p-2 -ml-2 text-[#616161] hover:text-[#0067b8] transition-colors"
          title="Voltar"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="text-sm font-semibold ml-2 text-[#2b2b2b]">Iniciar Operações</h1>
      </header>

      <main className="p-6 max-w-lg mx-auto flex flex-col items-center">
        {/* Central Icon */}
        <div className="mb-8 mt-4">
          <div className={cn(
            "w-24 h-24 rounded-full bg-white border border-[#e1e1e1] flex items-center justify-center relative transition-all duration-1000",
            isOperating ? "scale-105 border-[#0067b8] shadow-[0_0_20px_rgba(0,103,184,0.1)]" : ""
          )}>
            <div className={cn(
              "absolute inset-0 rounded-full border-2 border-transparent border-t-[#0067b8] animate-spin transition-opacity duration-300",
              isOperating ? "opacity-100" : "opacity-0"
            )} />
            {isCompleted ? (
              <CheckCircle2 className="w-10 h-10 text-[#107c10]" />
            ) : (
              <Cpu className={cn(
                "w-10 h-10 text-[#0067b8]",
                isOperating ? "animate-pulse" : ""
              )} />
            )}
          </div>
        </div>

        <div className="text-center mb-10">
          <h2 className="text-lg font-bold text-[#2b2b2b] tracking-tight mb-1">Coleta de Rendimentos</h2>
          <p className="text-xs text-[#616161]">Ative seus servidores para obter lucros diários.</p>
        </div>

        {/* Flat Card Container */}
        <div className="w-full bg-white border border-[#e1e1e1] p-8 space-y-8 rounded-sm">
          {/* Status Section */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <Activity size={14} className="text-[#0067b8]" />
                <span className="text-[10px] font-bold text-[#616161] uppercase tracking-widest">Status do Sistema</span>
              </div>
              <span className={cn(
                "text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-sm",
                isOperating ? "bg-[#f3f2f1] text-[#0067b8]" : 
                isCompleted ? "bg-[#dff6dd] text-[#107c10]" : "bg-[#f3f2f1] text-[#616161]"
              )}>
                {isOperating ? "Processando" : isCompleted ? "Concluído" : "Aguardando"}
              </span>
            </div>

            {/* Flat Progress Bar */}
            <div className="relative h-2 bg-[#f3f2f1] overflow-hidden rounded-full">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                className={cn(
                  "h-full transition-all duration-300",
                  isCompleted ? "bg-[#107c10]" : "bg-[#0067b8]"
                )}
              />
            </div>
            
            <div className="flex justify-between text-[9px] font-bold text-[#616161] uppercase tracking-widest">
              <span>{isOperating ? "Sincronizando..." : "0% Sincronizado"}</span>
              <span>{progress}% Concluído</span>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#fcfcfc] p-4 border border-[#f3f3f3] text-left">
              <p className="text-[9px] text-[#616161] font-bold uppercase tracking-widest mb-1">Rendimento Estimado</p>
              <p className="text-sm font-bold text-[#2b2b2b]">{estimatedIncome.toLocaleString('pt-BR')},00 Kz</p>
            </div>
            <div className="bg-[#fcfcfc] p-4 border border-[#f3f3f3] text-left">
              <p className="text-[9px] text-[#616161] font-bold uppercase tracking-widest mb-1">Tarefas Restantes</p>
              <p className="text-sm font-bold text-[#2b2b2b]">{isCompleted ? "0 / 1" : (hasServers ? "1 / 1" : "0 / 1")}</p>
            </div>
          </div>

          <Button 
            onClick={startTask}
            isLoading={isOperating}
            className={cn(
              "w-full py-4 text-xs font-bold uppercase tracking-[0.2em] h-14",
              isCompleted ? "bg-[#107c10] hover:bg-[#107c10] cursor-default" : "bg-[#0067b8] hover:bg-[#005a9e]"
            )}
            disabled={isCompleted || loading}
          >
            {isCompleted ? <CheckCircle2 size={18} className="mr-2" /> : <Zap size={18} className="mr-2" />}
            {isCompleted ? "Rendimentos Coletados" : "Iniciar Operações"}
          </Button>
        </div>

        {/* Microsoft Footer Node */}
        <div className="mt-12 text-center opacity-40">
           <div className="flex items-center justify-center space-x-1 mb-3">
             <div className="w-2 h-2 bg-[#f25022]" />
             <div className="w-2 h-2 bg-[#7fba00]" />
             <div className="w-2 h-2 bg-[#00a4ef]" />
             <div className="w-2 h-2 bg-[#ffb900]" />
           </div>
           <p className="text-[9px] text-[#616161] font-bold uppercase tracking-[0.3em]">
             Microsoft Partner Network Official Node
           </p>
        </div>
      </main>
    </div>
  );
}
