import React, { useState, useEffect } from 'react';
import { Copy, Users, ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/Button';
import { useToast } from '../components/Toast';
import { useLanguage } from '../contexts/LanguageContext';
import { supabase } from '../lib/supabase';
import { cn } from '../lib/utils';

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
    <div className="min-h-screen bg-[#f8f9fa] pb-10">
      {/* Header */}
      <header className="bg-white px-[4px] h-14 flex items-center justify-between sticky top-0 z-50 border-b border-gray-100">
        <div className="flex items-center">
          <button 
            onClick={() => navigate(-1)} 
            aria-label={t('common.back') || 'Voltar'}
            title={t('common.back') || 'Voltar'}
            className="p-3 text-gray-800"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-black text-gray-900 tracking-tight ml-1">Convite</h1>
        </div>
        <div className="px-4">
          <div className="w-8 h-8 bg-gray-50 flex items-center justify-center">
            <Users size={18} className="text-ms-blue" />
          </div>
        </div>
      </header>

      <div className="px-[4px] py-4 space-y-[4px]">
        {/* Top Invite Card */}
        <div className="bg-white p-8 border border-gray-100 text-center space-y-8">
          <div className="flex flex-col items-center justify-center space-y-1">
            <span className="text-[10px] font-black text-gray-400 tracking-[0.2em]">Seu Código</span>
            <span className="text-5xl font-black text-[#f04a43] tracking-tighter">
              {loading ? '...' : inviteCode}
            </span>
          </div>

          <button
            onClick={() => copyToClipboard(inviteLink)}
            className="w-full h-14 bg-[#f04a43] text-white text-xs font-black tracking-[0.2em] transition-transform active:scale-[0.98] shadow-lg shadow-[#f04a43]/20"
          >
            Copiar Link de Convite
          </button>
        </div>

        {/* Team Section */}
        <div className="bg-white border border-gray-100">
          <div className="px-6 py-5 border-b border-gray-50 flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-gray-400 tracking-widest">Equipe Total</span>
              <span className="text-2xl font-black text-gray-900 tracking-tight">{loading ? '...' : stats.team_count}</span>
            </div>
            <div className="text-right flex flex-col">
              <span className="text-[10px] font-black text-gray-400 tracking-widest">Comissões</span>
              <span className="text-base font-black text-[#f04a43]">{loading ? '...' : stats.total_comissao_equipe.toLocaleString()} Kz</span>
            </div>
          </div>
          
          <div className="flex bg-gray-50/50">
            {['level1', 'level2', 'level3'].map((lvl) => (
              <button
                key={lvl}
                onClick={() => setActiveLevel(lvl as any)}
                className={cn(
                  "flex-1 py-4 text-[10px] font-black tracking-tighter transition-all relative",
                  activeLevel === lvl ? "text-[#f04a43] bg-white" : "text-gray-400"
                )}
              >
                Nível {lvl.slice(-1)}
                {activeLevel === lvl && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#f04a43]" />
                )}
              </button>
            ))}
          </div>

          <div className="p-4 min-h-[400px]">
            {teamData[activeLevel].length > 0 ? (
              <div className="space-y-[1px] bg-gray-100 -mx-4 -mb-4">
                {teamData[activeLevel].map((person: any, i: number) => (
                  <div key={i} className="bg-white flex items-center justify-between px-4 py-4 active:bg-gray-50 transition-colors">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gray-50 flex items-center justify-center">
                        <Users size={18} className="text-gray-200" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-gray-900 tracking-tight">{maskPhone(person.telefone)}</span>
                        <span className="text-[9px] font-bold text-gray-400">Membro desde {new Date(person.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-black text-gray-900">
                        {Number(person.total_investido).toLocaleString()} Kz
                      </span>
                      <div className="flex items-center justify-end space-x-1 mt-0.5">
                         <div className={cn("w-1.5 h-1.5 rounded-full", Number(person.total_investido) > 0 ? "bg-green-500" : "bg-gray-300")} />
                         <span className="text-[8px] font-black text-gray-400">{Number(person.total_investido) > 0 ? 'Ativo' : 'Inativo'}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-20 text-center space-y-6">
                <div className="w-32 h-32 mx-auto opacity-10">
                   <Users size={128} className="text-gray-900" />
                </div>
                <p className="text-[10px] font-black text-gray-300 tracking-widest italic">Sem dados registrados no momento</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
