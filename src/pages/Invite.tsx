import React, { useState, useEffect } from 'react';
import { Copy, Users, ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/Button';
import { useToast } from '../components/Toast';
import { useLanguage } from '../contexts/LanguageContext';
import { supabase } from '../lib/supabase';
import { cn } from '@/src/lib/utils';

export default function Invite() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { t } = useLanguage();
  const [activeLevel, setActiveLevel] = useState<'level1' | 'level2' | 'level3'>('level1');
  const [teamData, setTeamData] = useState<any>({ level1: [], level2: [], level3: [] });
  const [stats, setStats] = useState({ total_comissao_equipe: 0, team_count: 0 });
  const [inviteCode, setInviteCode] = useState<string>('---');
  const [baseUrl, setBaseUrl] = useState<string>(window.location.origin);
  const [loading, setLoading] = useState(true);
  
  const inviteLink = `${baseUrl}/cadastro?join=${inviteCode}`;

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        // Fetch invite code
        const { data: settingsData } = await supabase.rpc('get_my_settings_data_mcpn');
        if (settingsData && settingsData.length > 0) {
          setInviteCode(settingsData[0].invite_code || '---');
        }

        // Fetch team list
        const { data: teamList } = await supabase.rpc('get_my_team_detailed');
        if (teamList) {
          setTeamData({
            level1: teamList.filter((m: any) => m.nivel === 1),
            level2: teamList.filter((m: any) => m.nivel === 2),
            level3: teamList.filter((m: any) => m.nivel === 3),
          });
        }

        // Fetch team stats
        const { data: accData } = await supabase.rpc('get_my_account_data');
        if (accData && accData.length > 0) {
          setStats({
            total_comissao_equipe: Number(accData[0].total_comissao_equipe) || 0,
            team_count: teamList?.length || 0
          });
        }

        // Fetch official base URL
        const { data: linksData } = await supabase.from('atendimento_links').select('link_app_atualizado').maybeSingle();
        if (linksData?.link_app_atualizado) {
          setBaseUrl(linksData.link_app_atualizado.replace(/\/$/, ''));
        }
      } catch (err: any) {
        console.error('Erro ao buscar dados:', err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    showToast(t('invite.copy_toast'), 'info');
  };

  const maskPhone = (phone: string) => {
    if (!phone) return '*** *** ***';
    return phone.substring(0, 3) + ' *** ' + phone.substring(6);
  };

  return (
    <div className="min-h-screen bg-[#f7f8fa] pb-10">
      {/* Header */}
      <header className="bg-white px-4 h-14 flex items-center justify-between sticky top-0 z-50">
        <button 
          onClick={() => navigate(-1)} 
          aria-label={t('common.back') || 'Voltar'}
          title={t('common.back') || 'Voltar'}
          className="p-2 -ml-2 text-gray-800"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="text-lg font-bold text-gray-900">Convite</h1>
        <div className="w-8" /> {/* Spacer */}
      </header>

      <div className="p-4 space-y-4">
        {/* Top Invite Card */}
        <div className="bg-white rounded-xl p-8 shadow-sm text-center space-y-8">
          <div className="flex items-center justify-center space-x-3">
            <span className="text-gray-900 font-medium">Código de convite</span>
            <span className="text-3xl font-bold text-[#f04a43] tracking-tight">
              {loading ? '...' : inviteCode}
            </span>
          </div>

          <button
            onClick={() => copyToClipboard(inviteLink)}
            className="w-full h-12 bg-[#ffe4cc] text-[#cc7a33] font-bold rounded-full transition-transform active:scale-[0.98]"
          >
            Copiar link de convite
          </button>
        </div>

        {/* Team Section */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Equipe</span>
              <span className="text-xl font-bold text-gray-900">{loading ? '...' : stats.team_count}</span>
            </div>
            <div className="text-right flex flex-col">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Comissão Acumulada</span>
              <span className="text-sm font-black text-[#f04a43]">{loading ? '...' : stats.total_comissao_equipe.toLocaleString()} Kz</span>
            </div>
          </div>
          <div className="flex border-b border-gray-100">
            {['level1', 'level2', 'level3'].map((lvl) => (
              <button
                key={lvl}
                onClick={() => setActiveLevel(lvl as any)}
                className={cn(
                  "flex-1 py-4 text-sm font-medium transition-colors relative",
                  activeLevel === lvl ? "text-[#f04a43]" : "text-gray-400"
                )}
              >
                Nível {lvl.slice(-1)}
                {activeLevel === lvl && (
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-[#f04a43] rounded-full" />
                )}
              </button>
            ))}
          </div>

          <div className="p-10 flex flex-col items-center justify-center min-h-[300px]">
            {teamData[activeLevel].length > 0 ? (
              <div className="w-full space-y-3">
                {teamData[activeLevel].map((person: any, i: number) => (
                  <div key={i} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center">
                        <Users size={18} className="text-gray-300" />
                      </div>
                      <span className="text-sm font-bold text-gray-700">{maskPhone(person.telefone)}</span>
                    </div>
                    <span className="text-xs font-bold text-[#f04a43]">
                      {Number(person.total_investido).toLocaleString()} Kz
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center space-y-6">
                <div className="w-48 h-48 mx-auto relative opacity-40 grayscale">
                   <img src="/collection.png" alt="folder" className="w-full h-full object-contain" />
                </div>
                <p className="text-gray-400 text-sm">Sem dados~</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
