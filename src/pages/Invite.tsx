import React, { useState } from 'react';
import { Copy, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/Button';
import { useToast } from '../components/Toast';
import { useLanguage } from '../contexts/LanguageContext';

export default function Invite() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { t } = useLanguage();
  const [isSharing, setIsSharing] = useState(false);
  const inviteLink = "https://ms-cloud.app/join?ref=WIN10PRO";
  const inviteCode = "WIN10PRO";

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
                <span className="text-sm text-ms-blue flex-grow truncate">{inviteLink}</span>
                <button 
                  onClick={() => copyToClipboard(inviteLink)} 
                  className="ml-2 text-gray-400 hover:text-ms-blue transition-colors"
                  title={t('invite.copy', { defaultValue: 'Copiar link' })}
                  aria-label={t('invite.copy', { defaultValue: 'Copiar link' })}
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
                <span className="text-xl font-mono flex-grow">{inviteCode}</span>
                <button 
                  onClick={() => copyToClipboard(inviteCode)} 
                  className="ml-2 text-gray-400 hover:text-ms-blue transition-colors"
                  title={t('invite.copy', { defaultValue: 'Copiar código' })}
                  aria-label={t('invite.copy', { defaultValue: 'Copiar código' })}
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
