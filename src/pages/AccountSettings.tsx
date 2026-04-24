import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Key, ShieldCheck, Phone, Globe, Copy, Check } from 'lucide-react';
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

  return (
    <div className="min-h-screen bg-[#f2f2f2] pb-20">
      <header className="bg-white p-4 flex items-center border-b border-[#e1e1e1] sticky top-0 z-10">
        <button 
          onClick={() => navigate('/perfil')} 
          className="p-2 -ml-2 text-[#616161]"
          aria-label="Voltar para o perfil"
          title="Voltar"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="text-sm font-semibold ml-2 text-[#2b2b2b]">Minha Conta</h1>
      </header>

      <div className="p-6 max-w-4xl mx-auto space-y-8">
        <div className="pt-4">
          <h2 className="text-4xl font-light text-[#2b2b2b] mb-2 tracking-tight">{t('settings.title')}</h2>
          <p className="text-sm text-[#616161] max-w-md">Gerencie suas credenciais e preferências de segurança.</p>
        </div>

        <section className="bg-white border border-[#e1e1e1] rounded-sm shadow-sm overflow-hidden">
          <div className="p-8 flex flex-col sm:flex-row items-center sm:items-start space-y-6 sm:space-y-0 sm:space-x-8">
            <div className="w-24 h-24 bg-[#0067b8] rounded-full flex items-center justify-center border-4 border-white shadow-md shrink-0">
              <span className="text-3xl font-light text-white uppercase tracking-tighter">{getInitials()}</span>
            </div>
            
            <div className="flex-1 text-center sm:text-left">
              <h3 className="text-2xl font-semibold text-[#2b2b2b] mb-1">
                {loading ? 'Carregando...' : `Usuário ${profile?.phone || ''}`}
              </h3>
              
              <div className="flex flex-col space-y-1 mb-6">
                <div className="flex items-center justify-center sm:justify-start space-x-2 text-gray-500 text-xs font-medium">
                  <Phone size={12} className="text-ms-blue" />
                  <span>{profile?.phone}</span>
                </div>

                <div className="flex items-center justify-center sm:justify-start space-x-2 mt-2">
                  <p className="text-[11px] font-bold text-gray-400 tracking-widest uppercase">
                    CÓDIGO: {profile?.invite_code || '---'}
                  </p>
                  <button 
                    onClick={() => copyToClipboard(profile?.invite_code)}
                    className="p-1 text-ms-blue hover:bg-ms-blue/5 rounded-sm transition-colors"
                  >
                    {copied ? <Check size={12} className="text-[#107c10]" /> : <Copy size={12} />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 gap-8">
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em] px-1">Segurança e Idioma</h4>
            <div className="bg-white border border-[#e1e1e1] rounded-sm overflow-hidden divide-y divide-[#f3f3f3]">
              <div className="relative group">
                <div className="w-full flex items-center justify-between p-5 group-hover:bg-[#f9f9f9] transition-colors">
                  <div className="flex items-center space-x-5 text-left">
                    <Globe size={24} className="text-[#616161]" strokeWidth={1.5} />
                    <div>
                      <p className="text-sm font-bold text-[#2b2b2b]">{t('settings.language')}</p>
                      <p className="text-[11px] text-[#616161]">
                        {language === 'pt' ? 'Português' : language === 'en' ? 'English' : 'Français'}
                      </p>
                    </div>
                  </div>
                  <LanguageSelector className="scale-90" variant="minimal" />
                </div>
              </div>

              <button 
                onClick={() => navigate('/alterar-senha')}
                className="w-full flex items-center justify-between p-5 hover:bg-[#f9f9f9] transition-colors group"
              >
                <div className="flex items-center space-x-5 text-left">
                  <Key size={24} className="text-[#616161] group-hover:text-ms-blue" strokeWidth={1.5} />
                  <div>
                    <p className="text-sm font-bold text-[#2b2b2b]">Alterar Senha</p>
                    <p className="text-[11px] text-[#616161]">Atualize sua credencial de acesso.</p>
                  </div>
                </div>
              </button>

              <button 
                onClick={() => navigate('/autenticacao')}
                className="w-full flex items-center justify-between p-5 hover:bg-[#f9f9f9] transition-colors group"
              >
                <div className="flex items-center space-x-5 text-left">
                  <ShieldCheck size={24} className="text-[#616161] group-hover:text-ms-blue" strokeWidth={1.5} />
                  <div>
                    <p className="text-sm font-bold text-[#2b2b2b]">Autenticação de Identidade</p>
                    <p className="text-[11px] text-[#616161]">Confirme sua identidade para saques maiores.</p>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>

        <div className="pt-10">
          <button 
            onClick={handleLogout}
            className="w-full py-4 bg-white border border-red-100 text-red-600 text-xs font-bold uppercase tracking-[0.2em] hover:bg-red-50 transition-colors"
          >
            Sair da conta
          </button>
        </div>

        <div className="text-center pt-12 pb-16">
          <p className="text-[10px] text-gray-300 uppercase font-bold tracking-[0.4em]">
            Microsoft Cloud Net • 2026
          </p>
        </div>
      </div>
    </div>
  );
}
