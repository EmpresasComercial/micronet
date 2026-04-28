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
  const [stats, setStats] = useState({
    total_comissao_equipe: 0,
    team_count: 0
  });
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState('');

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        // Get current user ID for display
        const { data: { user } } = await supabase.auth.getUser();
        if (user) setUserId(user.id.slice(0, 8).toUpperCase());

        // Fetch detailed team list
        const { data: teamList } = await supabase.rpc('get_my_team_detailed');
        if (teamList) {
          setTeamData({
            level1: teamList.filter((m: any) => m.nivel === 1),
            level2: teamList.filter((m: any) => m.nivel === 2),
            level3: teamList.filter((m: any) => m.nivel === 3),
          });
        }

        // Fetch official commission stats
        const { data: accData } = await supabase.rpc('get_my_account_data');
        if (accData && accData.length > 0) {
          setStats({
            total_comissao_equipe: Number(accData[0].total_comissao_equipe) || 0,
            team_count: (teamList?.length || 0)
          });
        }
      } catch (err: any) {
        console.error('Erro ao carregar dados da equipe:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
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
    <div className="px-[4px] py-4 w-full bg-[#f8f9fa] min-h-screen">
      <header className="mb-6 mt-2 px-3 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <button 
            onClick={() => navigate('/convite')} 
            aria-label={t('common.back') || 'Voltar'}
            title={t('common.back') || 'Voltar'}
            className="p-1 -ml-1 text-gray-600 active:text-ms-blue transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <span className="w-px h-3 bg-gray-300 mx-1"></span>
          <h1 className="text-xl font-bold text-[#1b1b1b]">{t('team.header')}</h1>
        </div>
        <div className="w-10 h-10 bg-white border border-gray-100 flex items-center justify-center">
          <BarChart3 className="w-5 h-5 text-ms-blue" />
        </div>
      </header>

      <div className="space-y-4 px-1">
        {/* Stats Section */}
        <div className="bg-white p-5 border border-gray-100">
          <div className="flex justify-between items-start mb-6">
            <div>
              <p className="text-[10px] font-black text-ms-blue uppercase tracking-widest mb-1">
                {t('team.stats_total')}
              </p>
              <h2 className="text-4xl font-black text-gray-900 tracking-tighter">
                {loading ? '...' : stats.team_count}
              </h2>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
                {t('team.stats_com')}
              </p>
              <p className="text-lg font-black text-gray-900">
                {loading ? '...' : stats.total_comissao_equipe.toLocaleString()} Kz
              </p>
            </div>
          </div>
          <div className="pt-4 border-t border-gray-50 flex items-center justify-between text-[10px] text-gray-400 font-bold uppercase tracking-widest">
            <span>Microsoft Cloud Partner</span>
            <span className="text-ms-blue/30">Network ID: {userId || '...'}</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex bg-white border-y border-gray-100">
          {levels.map((lvl) => (
            <button
              key={lvl.id}
              onClick={() => setActiveLevel(lvl.id as any)}
              className={cn(
                "flex-1 py-4 text-[10px] font-black uppercase tracking-tighter transition-all relative",
                activeLevel === lvl.id 
                  ? "text-ms-blue" 
                  : "text-gray-400"
              )}
            >
              {lvl.label}
              {lvl.count > 0 && (
                <span className="ml-1 opacity-50">({lvl.count})</span>
              )}
              {activeLevel === lvl.id && (
                <motion.div 
                  layoutId="activeTab"
                  className="absolute bottom-0 left-4 right-4 h-1 bg-ms-blue" 
                />
              )}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative px-2">
          <input 
            type="text" 
            placeholder={t('team.search_placeholder')} 
            className="w-full bg-white border-b border-gray-200 pl-8 pr-4 py-3 text-sm text-gray-600 outline-none focus:border-ms-blue transition-colors"
          />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
        </div>

        {/* List */}
        <div className="space-y-[1px] bg-gray-100">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeLevel}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-[1px]"
            >
              {teamData[activeLevel].map((person: any, i: number) => (
                <div 
                  key={i} 
                  className="bg-white px-4 py-4 flex items-center justify-between active:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-50 flex items-center justify-center">
                      <Users size={18} className="text-gray-300" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-bold text-gray-900">{maskPhone(person.telefone)}</span>
                        <div className={cn(
                          "w-1.5 h-1.5 rounded-full",
                          Number(person.total_investido) > 0 ? "bg-green-500" : "bg-gray-300"
                        )} />
                      </div>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">
                        {t('team.member_since')} {new Date(person.created_at).toLocaleDateString('pt-AO')}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-gray-900">{Number(person.total_investido).toLocaleString()} Kz</p>
                    <p className={cn(
                      "text-[9px] font-black uppercase tracking-widest",
                      Number(person.total_investido) === 0 ? "text-gray-300" : "text-green-600"
                    )}>
                      {Number(person.total_investido) === 0 ? t('team.inactive') : t('team.active')}
                    </p>
                  </div>
                </div>
              ))}
              
              {teamData[activeLevel].length === 0 && !loading && (
                <div className="bg-white py-20">
                  <EmptyState 
                    icon={<Users size={40} className="text-gray-100" />}
                    message={t('team.empty')}
                    description="Rede de parceiros vazia neste nível."
                  />
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
