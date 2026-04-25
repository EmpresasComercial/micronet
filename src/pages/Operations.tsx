import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Cpu, Activity, Zap, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '@/src/lib/utils';
import { Button } from '../components/Button';
import { useToast } from '../components/Toast';
import { useLanguage } from '../contexts/LanguageContext';
import { supabase } from '../lib/supabase';

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
        const { data, error } = await supabase.rpc('get_daily_ops_status_mcpn');

        if (error) throw error;
        
        if (data?.success) {
          setEstimatedIncome(Number(data.estimated_income || 0));
          setHasServers(data.has_servers || false);
          
          if (data.is_collected_today) {
            setIsCompleted(true);
            setProgress(100);
          }
        }
      } catch (err: any) {
        console.error('Erro ao checar status:', err.message);
        showToast('Falha ao sincronizar com o servidor.', 'error');
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

    const duration = 3000;
    const interval = 50;
    const steps = duration / interval;
    const increment = 100 / steps;
    
    let currentProgress = 0;
    const timer = setInterval(async () => {
      currentProgress += increment;
      if (currentProgress >= 100) {
        setProgress(100);
        clearInterval(timer);
        
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
            showToast(data?.message || 'Já coletado ou erro no processamento.', 'error');
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
    <div className="min-h-screen relative pb-20 font-sans overflow-hidden bg-[#f3f3f3]">
      <div className="absolute inset-0 z-0">
        <img 
          src="/Introduccion-a-Microsoft-Windows.webp" 
          className="w-full h-full object-cover opacity-15 mix-blend-overlay scale-110 blur-[2px]" 
          alt="background" 
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#f3f3f3]/80 via-transparent to-[#f3f3f3]" />
      </div>

      <header className="bg-white/80 backdrop-blur-md p-4 flex items-center border-b border-[#e1e1e1] sticky top-0 z-50">
        <button 
          onClick={() => navigate('/perfil')} 
          className="p-2 -ml-2 text-[#616161] hover:text-[#0067b8] transition-colors"
          title="Voltar"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="text-sm font-semibold ml-2 text-[#2b2b2b]">Iniciar Operações</h1>
      </header>

      <main className="relative z-10 p-6 max-w-lg mx-auto flex flex-col items-center">
        <div className="mb-10 mt-6">
          <div className={cn(
            "w-28 h-28 bg-white border border-[#e5e5e5] flex items-center justify-center relative transition-all duration-700",
            isOperating ? "border-[#0067b8]" : ""
          )}>
            <div className={cn(
              "absolute -inset-1 border border-[#0067b8]/20 transition-opacity duration-300",
              isOperating ? "opacity-100 animate-pulse" : "opacity-0"
            )} />
            
            {isCompleted ? (
              <CheckCircle2 className="w-12 h-12 text-[#107c10]" />
            ) : (
              <div className="relative">
                <Cpu className={cn(
                  "w-12 h-12 text-[#0067b8] transition-transform duration-500",
                  isOperating ? "scale-90" : ""
                )} />
                {isOperating && (
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="absolute -inset-2 border-t-2 border-ms-blue rounded-full"
                  />
                )}
              </div>
            )}
          </div>
        </div>

        <div className="text-center mb-10 space-y-1">
          <h2 className="text-xl font-bold text-[#1b1b1b] tracking-tight">{t('ops.collect')}</h2>
          <p className="text-[11px] text-[#616161] font-medium max-w-[200px] mx-auto leading-tight">{t('ops.collect_sub')}</p>
        </div>

        <div className="w-full bg-white/90 backdrop-blur-sm border border-[#e5e5e5] p-8 space-y-8 relative overflow-hidden shadow-sm">
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b border-[#f3f3f3] pb-3">
              <div className="flex items-center space-x-2">
                <Activity size={14} className="text-[#0067b8]" />
                <span className="text-[10px] font-bold text-[#616161] uppercase tracking-widest">{t('ops.system_status')}</span>
              </div>
              <span className={cn(
                "text-[9px] font-bold uppercase tracking-widest px-2.5 py-1",
                isOperating ? "bg-[#0067b8] text-white" : 
                isCompleted ? "bg-[#107c10] text-white" : "bg-[#f3f2f1] text-[#616161]"
              )}>
                {isOperating ? t('ops.processing') : isCompleted ? t('ops.completed') : t('ops.waiting')}
              </span>
            </div>

            <div className="space-y-2">
              <div className="h-1 bg-[#f3f2f1] overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  className={cn(
                    "h-full transition-all duration-300 ease-out",
                    isCompleted ? "bg-[#107c10]" : "bg-[#0067b8]"
                  )}
                />
              </div>
              <div className="flex justify-between text-[9px] font-bold text-[#616161] uppercase tracking-[0.1em]">
                <span>{isOperating ? t('ops.synchronized') : "LINK OFFLINE"}</span>
                <span className={isCompleted ? "text-[#107c10]" : "text-[#0067b8]"}>{progress}%</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 border-t border-[#f3f3f3]">
            <div className="p-4 border-r border-[#f3f3f3]">
              <p className="text-[9px] text-[#616161] font-bold uppercase tracking-widest mb-1">{t('ops.estimated')}</p>
              <p className="text-sm font-bold text-[#1b1b1b]">{estimatedIncome.toLocaleString('pt-BR')},00 Kz</p>
            </div>
            <div className="p-4">
              <p className="text-[9px] text-[#616161] font-bold uppercase tracking-widest mb-1">{t('ops.tasks_left')}</p>
              <p className="text-sm font-bold text-[#1b1b1b]">{isCompleted ? "0 / 1" : (hasServers ? "1 / 1" : "0 / 1")}</p>
            </div>
          </div>

          <Button 
            onClick={startTask}
            isLoading={isOperating}
            className={cn(
              "w-full py-4 text-xs font-bold uppercase tracking-[0.2em] h-14 rounded-none transition-all",
              isCompleted ? "bg-[#107c10] hover:bg-[#107c10] opacity-80" : "bg-[#0067b8] hover:bg-[#005a9e] active:scale-[0.98]"
            )}
            disabled={isCompleted || loading}
          >
            {isCompleted ? <CheckCircle2 size={18} className="mr-2" /> : <Zap size={18} className="mr-2" />}
            {isCompleted ? t('ops.btn_finished') : t('ops.btn_start')}
          </Button>
        </div>

        <div className="mt-12 text-center opacity-40">
           <div className="flex items-center justify-center space-x-1 mb-4">
             <div className="w-1.5 h-1.5 bg-[#f25022]" />
             <div className="w-1.5 h-1.5 bg-[#7fba00]" />
             <div className="w-1.5 h-1.5 bg-[#00a4ef]" />
             <div className="w-1.5 h-1.5 bg-[#ffb900]" />
           </div>
           <p className="text-[9px] text-[#616161] font-bold uppercase tracking-[0.4em]">
             Microsoft Partner Network Official Node
           </p>
        </div>
      </main>
    </div>
  );
}
