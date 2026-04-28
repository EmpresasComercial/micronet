import React, { useState, useEffect } from 'react';
import { Copy, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/Button';
import { useToast } from '../components/Toast';
import { useLanguage } from '../contexts/LanguageContext';
import { supabase } from '../lib/supabase';

export default function Invite() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { t } = useLanguage();
  const [isSharing, setIsSharing] = useState(false);
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

        // Fetch official base URL from atendimento_links
        const { data: linksData } = await supabase
          .from('atendimento_links')
          .select('link_app_atualizado')
          .limit(1)
          .maybeSingle();

        if (linksData?.link_app_atualizado) {
          // Remove trailing slash if present
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

  const handleShare = () => {
    setIsSharing(true);
    setTimeout(() => {
      setIsSharing(false);
      showToast(t('invite.toast_share'), 'success');
    }, 1500);
  };

  return (
    <div className="px-[4px] py-4 w-full bg-[#f8f9fa] min-h-screen">
      <header className="mb-6 mt-2 px-3 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <img 
            src="https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg" 
            alt="MS" 
            className="h-4"
            referrerPolicy="no-referrer"
          />
          <span className="w-px h-3 bg-gray-300 mx-1"></span>
          <h1 className="text-xl font-bold text-[#1b1b1b]">{t('invite.title')}</h1>
        </div>
        <button 
          onClick={() => navigate('/equipe')}
          className="w-10 h-10 bg-white border border-gray-100 flex items-center justify-center active:bg-gray-50 transition-colors shadow-sm"
          title={t('invite.team_btn')}
          aria-label={t('invite.team_btn')}
        >
          <Users size={20} className="text-gray-600" />
        </button>
      </header>

      <div className="space-y-4 px-2">
        {/* Link Section */}
        <div className="bg-white p-5 border border-gray-100">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-4">
            {t('invite.link_label')}
          </label>
          <div className="flex items-center space-x-3 bg-gray-50 p-3 rounded-sm border border-dashed border-gray-200">
            <span className="text-xs text-ms-blue font-bold truncate flex-1">
              {loading ? t('common.loading') : inviteLink}
            </span>
            <button 
              onClick={() => copyToClipboard(inviteLink)} 
              className="w-8 h-8 flex items-center justify-center bg-white border border-gray-200 active:bg-gray-100 transition-colors"
              aria-label={t('common.copy')}
            >
              <Copy className="w-4 h-4 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Code Section */}
        <div className="bg-white p-5 border border-gray-100">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-4">
            {t('invite.code_label')}
          </label>
          <div className="flex items-center justify-between">
            <span className="text-4xl font-black text-gray-900 tracking-tighter">
              {loading ? '...' : inviteCode}
            </span>
            <button 
              onClick={() => copyToClipboard(inviteCode)} 
              className="px-4 py-2 bg-ms-blue/5 text-ms-blue text-xs font-bold uppercase tracking-widest active:bg-ms-blue/10 transition-colors"
            >
              {t('common.copy')}
            </button>
          </div>
        </div>

        <div className="pt-8">
          <Button 
            onClick={handleShare}
            className="w-full h-14 shadow-lg shadow-ms-blue/20"
            isLoading={isSharing}
          >
            <span className="uppercase tracking-[0.2em] font-bold">{t('invite.btn_share')}</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
