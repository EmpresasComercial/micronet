import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Play, Cpu, Activity, Zap, CheckCircle2, Cloud } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/src/lib/utils';
import { Button } from '../components/Button';
import { useToast } from '../components/Toast';
import { useLanguage } from '../contexts/LanguageContext';
import { supabase } from '../lib/supabase';
import { useEffect } from 'react';

export default function Operations() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { t } = useLanguage();
  const [isOperating, setIsOperating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [estimatedIncome, setEstimatedIncome] = useState(0);
  const [hasServers, setHasServers] = useState(false);

  useEffect(() => {
    async function checkStatus() {
      try {
        // Get active products to calculate estimated income
        const { data: prods, error: pError } = await supabase
          .from('user_produtos')
          .select('renda_diaria')
          .eq('ativo', true)
          .gt('data_fim', new Date().toISOString());

        if (pError) throw pError;
        
        if (prods && prods.length > 0) {
          const total = prods.reduce((acc, curr) => acc + Number(curr.renda_diaria), 0);
          setEstimatedIncome(total);
          setHasServers(true);
        }

        // Check if already collected today
        const { data: collected, error: cError } = await supabase
          .from('renda_diaria_mcpn')
          .select('id')
          .gte('created_at', new Date().toISOString().split('T')[0])
          .limit(1);

        if (cError) throw cError;
        if (collected && collected.length > 0) {
          setIsCompleted(true);
          setProgress(100);
        }
      } catch (err: any) {
        console.error('Erro ao checar status de operações:', err.message);
      }
    }
    checkStatus();
  }, []);

  const startTask = async () => {
    if (isCompleted || !hasServers) {
      if (!hasServers) showToast('Você não tem servidores ativos.', 'error');
      return;
    }
    
    setIsOperating(true);
    let currentProgress = 0;
    const interval = setInterval(async () => {
      currentProgress += 5;
      setProgress(currentProgress);
      
      if (currentProgress >= 100) {
        clearInterval(interval);
        
        // Finalize in backend
        try {
          const { data, error } = await supabase.rpc('collect_daily_earnings');
          if (error) throw error;
          
          if (data?.success) {
            setIsCompleted(true);
            setIsOperating(false);
            showToast(`${t('common.success')}: +${Number(data.total_collected).toLocaleString()} Kz coletados`, 'success');
          } else {
            setIsOperating(false);
            setProgress(0);
            showToast(data?.message || 'Erro ao coletar rendimentos.', 'error');
          }
        } catch (err: any) {
          setIsOperating(false);
          setProgress(0);
          showToast('Erro na conexão com o servidor.', 'error');
        }
      }
    }, 100);
  };

  return (
    <div className="min-h-screen bg-ms-bg pb-20">
      <header className="bg-white p-4 flex items-center border-b border-[#d2d2d2] sticky top-0 z-10">
        <button onClick={() => navigate('/perfil')} className="p-2 -ml-2 text-gray-600" title="Voltar">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-semibold ml-2 text-gray-900">{t('ops.title')}</h1>
      </header>

      <div className="p-6 max-w-lg mx-auto space-y-6">
        {/* Branding Node */}
        <div className="flex flex-col items-center py-10 space-y-4">
          <div className="relative">
            <div className={cn(
              "p-8 rounded-full bg-white shadow-xl border border-[#e1e1e1] relative z-10 transition-all duration-700",
              isOperating ? "scale-110 border-ms-blue shadow-ms-blue/20" : ""
            )}>
              {isCompleted ? (
                <CheckCircle2 className="w-16 h-16 text-green-500" />
              ) : (
                <Cpu className={cn(
                  "w-16 h-16 text-ms-blue transition-all",
                  isOperating ? "animate-pulse" : ""
                )} />
              )}
            </div>
            {isOperating && (
              <motion.div 
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute inset-0 border-4 border-ms-blue/30 rounded-full animate-ping"
              />
            )}
          </div>
          
          <div className="text-center">
            <img 
              src="https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg" 
              alt="Microsoft" 
              className="h-4 mx-auto mb-4 opacity-40 grayscale"
              referrerPolicy="no-referrer"
            />
            <h2 className="text-lg font-bold text-gray-900 tracking-tight">{t('ops.collect')}</h2>
            <p className="text-xs text-gray-500 font-medium">{t('ops.collect_sub')}</p>
          </div>
        </div>

        {/* Task Control Card */}
        <div className="ms-card p-10 space-y-8 overflow-hidden relative">
          <div className="absolute top-0 right-0 p-4 opacity-10">
             <Cloud className="w-20 h-20 text-ms-blue" />
          </div>

          <div className="space-y-4 relative z-10">
            <div className="flex justify-between items-end">
              <div className="flex items-center space-x-2">
                <Activity className="w-4 h-4 text-ms-blue" />
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{t('ops.system_status')}</span>
              </div>
              <span className={cn(
                "text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-sm",
                isOperating ? "bg-blue-50 text-ms-blue animate-pulse" : 
                isCompleted ? "bg-green-50 text-green-600" : "bg-gray-50 text-gray-400"
              )}>
                {isOperating ? t('ops.processing') : isCompleted ? t('ops.completed') : t('ops.waiting')}
              </span>
            </div>

            {/* Progress Bar Container */}
            <div className="h-4 bg-[#f2f2f2] rounded-full overflow-hidden border border-[#e1e1e1]">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                className="h-full bg-gradient-to-r from-ms-blue to-blue-400 transition-all duration-300"
              />
            </div>
            
            <div className="flex justify-between text-[9px] font-bold text-gray-400 uppercase tracking-widest">
              <span>0% {t('ops.synchronized')}</span>
              <span>{progress}% {t('ops.completed')}</span>
            </div>
          </div>

          <div className="space-y-4">
             <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50/50 p-4 rounded-sm border border-black/5">
                   <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mb-1 italic">{t('ops.estimated')}</p>
                   <p className="text-sm font-bold text-gray-900">{estimatedIncome.toLocaleString()},00 Kz</p>
                </div>
                <div className="bg-gray-50/50 p-4 rounded-sm border border-black/5">
                   <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mb-1 italic">{t('ops.tasks_left')}</p>
                   <p className="text-sm font-bold text-gray-900">{isCompleted ? 0 : (hasServers ? 1 : 0)} / 1</p>
                </div>
             </div>

             <Button 
               onClick={startTask}
               isLoading={isOperating}
               className={cn(
                 "w-full",
                 isCompleted ? "bg-green-500 hover:bg-green-600 text-white cursor-default" : ""
               )}
               disabled={isCompleted}
             >
               {isCompleted ? <CheckCircle2 size={18} /> : <Zap size={18} />}
               <span>{isCompleted ? t('ops.btn_finished') : t('ops.btn_start')}</span>
             </Button>
          </div>
        </div>

        {/* Footer Identity */}
        <div className="text-center pt-10">
          <div className="inline-flex items-center space-x-4 opacity-30 grayscale saturate-0 mb-2">
            <div className="w-1 h-3 bg-red-500" />
            <div className="w-1 h-3 bg-green-500" />
            <div className="w-1 h-3 bg-blue-500" />
            <div className="w-1 h-3 bg-yellow-500" />
          </div>
          <p className="text-[9px] text-gray-300 font-bold uppercase tracking-[0.3em]">Microsoft Partner Network Official Node</p>
        </div>
      </div>
    </div>
  );
}
