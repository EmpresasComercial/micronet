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
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <header className="mb-8 flex items-center justify-between">
        <div>
          <img 
            src="https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg" 
            alt="MS" 
            className="h-5 mb-6"
            referrerPolicy="no-referrer"
          />
          <h1 className="text-2xl font-semibold">{t('invite.title')}</h1>
        </div>
        <button 
          onClick={() => navigate('/equipe')}
          className="p-3 bg-white border border-[#e1e1e1] text-gray-600 rounded-sm shadow-sm hover:text-ms-blue transition-colors"
          title={t('invite.team_btn')}
        >
          <Users size={20} />
        </button>
      </header>

      <div className="ms-card p-8">
        <h2 className="text-lg font-semibold mb-6">{t('invite.partnership')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase">{t('invite.link_label')}</label>
              <div className="flex items-center border-b border-gray-400 py-2">
                <span className="text-sm text-ms-blue flex-grow truncate">{loading ? t('common.loading') : inviteLink}</span>
                <button 
                  onClick={() => copyToClipboard(inviteLink)} 
                  className="ml-2 text-gray-400 hover:text-ms-blue transition-colors"
                  title={t('common.copy')}
                  aria-label={t('common.copy')}
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase">{t('invite.code_label')}</label>
              <div className="flex items-center border-b border-gray-400 py-2">
                <span className="text-xl font-mono flex-grow">{loading ? '...' : inviteCode}</span>
                <button 
                  onClick={() => copyToClipboard(inviteCode)} 
                  className="ml-2 text-gray-400 hover:text-ms-blue transition-colors"
                  title={t('common.copy')}
                  aria-label={t('common.copy')}
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="pt-4">
        <Button 
          onClick={handleShare}
          className="w-full"
          isLoading={isSharing}
        >
          <span>{t('invite.btn_share')}</span>
        </Button>
      </div>
    </div>
  );
}
