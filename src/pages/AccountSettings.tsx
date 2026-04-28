import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Copy, Check, Lock, Globe } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { LanguageSelector } from '../components/LanguageSelector';
import { supabase } from '../lib/supabase';
import { useToast } from '../components/Toast';

export default function AccountSettings() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { language, t } = useLanguage();
  const [copied, setCopied] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const { data, error } = await supabase.rpc('get_my_settings_data_mcpn');
        if (error) throw error;
        if (data && data.length > 0) {
          setProfile(data[0]);
        }
      } catch (err: any) {
        console.error('Erro ao buscar perfil:', err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    showToast('Copiado para a área de transferência', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const getInitials = () => {
    if (profile?.phone) return profile.phone.substring(0, 2);
    return 'MS';
  };

  const infoRows = [
    {
      label: 'Apelido',
      value: profile?.nickname || profile?.phone || '---',
      locked: false,
    },
    {
      label: 'Número de celular',
      value: profile?.phone || '---',
      locked: true,
    },
    {
      label: 'Nome de usuário',
      value: profile?.phone || '---',
      locked: true,
    },
    {
      label: 'ID',
      value: profile?.invite_code || '---',
      locked: true,
    },
  ];

  return (
    <div className="min-h-screen bg-[#f5f5f5] pb-24">
      {/* Header */}
      <header className="bg-white sticky top-0 z-10 flex items-center px-2 py-3 border-b border-[#e8e8e8]">
        <button
          onClick={() => navigate('/perfil')}
          className="p-2 text-gray-600 active:bg-gray-100 rounded-full transition-colors"
          aria-label={t('common.back')}
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="flex-1 text-center text-[15px] font-semibold text-[#1b1b1b]">
          {t('settings.title')}
        </h1>
        <div className="w-10" />
      </header>

      <div className="px-1 py-4 space-y-3">
        {/* Avatar Section */}
        <div className="bg-white mx-0 px-4 py-4 flex items-center justify-between">
          <span className="text-[15px] text-[#1b1b1b] font-medium">Avatar</span>
          <div className="relative">
            <div className="w-14 h-14 rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
              <img
                src="/perfil,pbg.webp"
                alt="Avatar"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -top-1 -right-1 bg-gray-500 rounded-full w-4 h-4 flex items-center justify-center">
              <span className="text-white text-[9px] font-bold">✕</span>
            </div>
          </div>
        </div>

        {/* Info Rows */}
        <div className="bg-white mx-0 divide-y divide-[#f0f0f0]">
          {infoRows.map((row, idx) => (
            <div key={idx} className="flex items-center justify-between px-4 py-[15px]">
              <span className="text-[14px] text-[#1b1b1b] font-medium">{row.label}</span>
              <div className="flex items-center space-x-2">
                <span className="text-[13px] text-gray-400 truncate max-w-[150px]">
                  {loading ? '...' : row.value}
                </span>
                {row.locked ? (
                  <Lock className="w-3.5 h-3.5 text-gray-300" />
                ) : (
                  <button
                    onClick={() => copyToClipboard(row.value)}
                    className="text-gray-400 active:opacity-60"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Language */}
        <div className="bg-white mx-0 divide-y divide-[#f0f0f0]">
          <div className="flex items-center justify-between px-4 py-[15px]">
            <div className="flex items-center space-x-3">
              <Globe className="w-4 h-4 text-gray-400" />
              <span className="text-[14px] text-[#1b1b1b] font-medium">{t('settings.language')}</span>
            </div>
            <LanguageSelector variant="minimal" className="scale-90" />
          </div>
        </div>

        {/* Action Rows */}
        <div className="bg-white mx-0 divide-y divide-[#f0f0f0]">
          <button
            onClick={() => navigate('/alterar-senha')}
            className="w-full flex items-center justify-between px-4 py-[15px] active:bg-gray-50 transition-colors"
          >
            <span className="text-[14px] text-[#1b1b1b] font-medium">{t('settings.change_password')}</span>
            <ChevronRight className="w-4 h-4 text-gray-300" />
          </button>
          <button
            onClick={() => navigate('/autenticacao')}
            className="w-full flex items-center justify-between px-4 py-[15px] active:bg-gray-50 transition-colors"
          >
            <span className="text-[14px] text-[#1b1b1b] font-medium">{t('settings.authenticate')}</span>
            <ChevronRight className="w-4 h-4 text-gray-300" />
          </button>
        </div>

        {/* Buttons */}
        <div className="px-4 pt-4 space-y-3">
          <button
            onClick={() => {}}
            className="w-full py-4 rounded-full bg-[#f5d9b8] text-[#c07a2f] font-semibold text-[15px] active:opacity-80 transition-opacity"
          >
            Salvar
          </button>
          <button
            onClick={handleLogout}
            className="w-full py-4 rounded-full border border-[#e8c8a0] text-[#c07a2f] font-semibold text-[15px] bg-white active:opacity-80 transition-opacity"
          >
            {t('settings.logout')}
          </button>
        </div>

        <div className="text-center pt-6 pb-4">
          <p className="text-[10px] text-gray-300 uppercase font-bold tracking-[0.3em]">
            Microsoft Exchange • 2026
          </p>
        </div>
      </div>
    </div>
  );
}
