import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Users, Phone, UserCircle, Briefcase, Trophy, BarChart3, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/src/lib/utils';
import { useLanguage } from '../contexts/LanguageContext';
import { supabase } from '../lib/supabase';
import { useEffect } from 'react';
import { EmptyState } from '../components/EmptyState';

export default function MyTeam() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [activeLevel, setActiveLevel] = useState<'level1' | 'level2' | 'level3'>('level1');
  const [teamData, setTeamData] = useState<any>({
    level1: [],
    level2: [],
    level3: []
  });
  const [totalCommissions, setTotalCommissions] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTeam() {
      try {
        const { data, error } = await supabase.rpc('get_my_team_detailed');
        if (error) throw error;

        if (data) {
          const categorized = {
            level1: data.filter((m: any) => m.nivel === 1),
            level2: data.filter((m: any) => m.nivel === 2),
            level3: data.filter((m: any) => m.nivel === 3),
          };
          setTeamData(categorized);
          
          // Cálculo de comissões baseado nas novas taxas (12%, 6%, 1%)
          const comms = data.reduce((acc: number, m: any) => {
            const rate = m.nivel === 1 ? 0.12 : m.nivel === 2 ? 0.06 : 0.01;
            return acc + (Number(m.total_investido) * rate);
          }, 0);
          setTotalCommissions(comms);
        }
      } catch (err: any) {
        console.error('Erro ao carregar equipe:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchTeam();
  }, []);

  const maskPhone = (phone: string) => {
    if (!phone) return '*** *** ***';
    return phone.substring(0, 3) + ' *** ' + phone.substring(6);
  };

  const levels = [
    { id: 'level1', label: t('team.level1'), icon: UserCircle, count: teamData.level1.length },
    { id: 'level2', label: t('team.level2'), icon: Briefcase, count: teamData.level2.length },
    { id: 'level3', label: t('team.level3'), icon: Trophy, count: teamData.level3.length },
  ];

  return (
    <div className="min-h-screen bg-[#f3f2f1] pb-20">
      <header className="bg-white p-4 flex items-center justify-between border-b border-[#edebe9] sticky top-0 z-50">
        <div className="flex items-center">
          <button onClick={() => navigate('/convite')} className="p-2 -ml-2 text-gray-600 hover:text-ms-blue transition-colors" title="Voltar">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="text-lg font-semibold ml-2 text-[#323130]">{t('team.header')}</h1>
        </div>
        <div className="p-2">
          <BarChart3 className="w-5 h-5 text-ms-blue" />
        </div>
      </header>

      <div className="p-5 max-w-2xl mx-auto space-y-5">
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-[#edebe9] p-6 rounded-[2px] shadow-sm relative overflow-hidden"
        >
          <div className="relative z-10 text-left">
            <p className="text-[10px] font-bold text-ms-blue uppercase tracking-widest mb-1 italic">{t('team.stats_total')}</p>
            <h2 className="text-3xl font-bold text-[#323130]">
              {teamData.level1.length + teamData.level2.length + teamData.level3.length}
            </h2>
            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center space-x-1">
                <img 
                  src="https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg" 
                  alt="MS" 
                  className="h-3.5 grayscale opacity-30"
                  referrerPolicy="no-referrer"
                />
                <span className="text-[9px] text-gray-400 font-bold uppercase tracking-[0.2em] pt-0.5">Cloud Partner Network</span>
              </div>
              <div className="text-right">
                <p className="text-[8px] font-bold text-ms-blue uppercase tracking-widest mb-0.5 italic">{t('team.stats_com')}</p>
                <p className="text-xs font-bold text-[#323130]">{totalCommissions.toLocaleString()},00 AOA</p>
              </div>
            </div>
          </div>
          <Users className="absolute right-[-20px] top-[-20px] w-40 h-40 text-ms-blue opacity-[0.03]" />
        </motion.div>

        <div className="flex border-b border-[#edebe9] bg-white rounded-t-sm">
          {levels.map((lvl) => (
            <button
              key={lvl.id}
              onClick={() => setActiveLevel(lvl.id as any)}
              className={cn(
                "flex-1 py-4 text-[10px] font-bold uppercase tracking-widest transition-all relative border-b-2",
                activeLevel === lvl.id 
                  ? "border-ms-blue text-ms-blue bg-blue-50/20" 
                  : "border-transparent text-[#605e5c] hover:bg-gray-50"
              )}
            >
              {lvl.label}
              {lvl.count > 0 && (
                <span className="ml-1.5 opacity-50">({lvl.count})</span>
              )}
            </button>
          ))}
        </div>

        <div className="relative">
          <input 
            type="text" 
            placeholder={t('team.search_placeholder')} 
            className="w-full bg-white border border-[#edebe9] pl-10 pr-4 py-2.5 text-xs text-gray-600 rounded-[2px] outline-none focus:border-ms-blue transition-colors"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        </div>

        <div className="space-y-2">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeLevel}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-2"
            >
              {teamData[activeLevel].map((person: any, i: number) => (
                <motion.div 
                  key={i} 
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-white border border-[#edebe9] p-4 flex items-center justify-between hover:bg-[#faf9f8] transition-colors"
                >
                  <div className="flex items-center space-x-3 text-left">
                    <div className="w-10 h-10 rounded-full border border-[#edebe9] bg-[#f3f2f1] flex items-center justify-center text-[#605e5c]">
                      <Users size={18} />
                    </div>
                    <div>
                      <div className="flex items-center space-x-1.5">
                        <span className="text-sm font-semibold text-[#323130] tracking-tight">{maskPhone(person.telefone)}</span>
                        <div className="w-1 h-1 bg-green-500 rounded-full animate-pulse" />
                      </div>
                      <p className="text-[8.5px] font-medium text-gray-400 mt-0.5">
                        {t('team.member_since')} {new Date(person.created_at).toLocaleDateString('pt-AO')}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={cn(
                      "text-[10px] font-bold px-2 py-0.5 rounded-sm inline-block mb-1",
                      Number(person.total_investido) === 0 ? "bg-gray-100 text-gray-500 border border-gray-200" : "bg-green-50 text-green-700 border border-green-100"
                    )}>
                      {Number(person.total_investido) === 0 ? t('team.inactive') : t('team.active')}
                    </div>
                    <p className="text-xs font-bold text-[#323130]">{Number(person.total_investido).toLocaleString()},00 Kz</p>
                  </div>
                </motion.div>
              ))}
              
              {teamData[activeLevel].length === 0 && !loading && (
                <EmptyState 
                  icon={<Users size={40} className="text-gray-100" />}
                  message={t('team.empty')}
                  description="Ainda não existem parceiros registrados neste nível da sua rede."
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
