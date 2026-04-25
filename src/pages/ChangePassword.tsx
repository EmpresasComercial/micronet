import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Key, ShieldCheck, Eye, EyeOff } from 'lucide-react';
import { motion } from 'motion/react';
import { useToast } from '../components/Toast';
import { Button } from '../components/Button';
import { supabase } from '../lib/supabase';
import { useLanguage } from '../contexts/LanguageContext';

export default function ChangePassword() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { t } = useLanguage();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPass, setShowPass] = useState(false);
  
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\s/g, '');
    setFormData({ ...formData, [e.target.name]: val });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.newPassword.length < 6) {
      showToast(t('auth.password_error_length'), 'error');
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      showToast(t('password.match_error'), 'error');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const { error } = await supabase.auth.updateUser({
        password: formData.newPassword
      });

      if (error) throw error;

      showToast(t('password.success'), 'success');
      setTimeout(() => navigate('/configuracoes-conta'), 1500);
    } catch (err: any) {
      showToast(err.message || t('common.error'), 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f2f2f2]">
      <header className="bg-white p-4 flex items-center border-b border-[#e1e1e1] sticky top-0 z-50">
        <button 
          onClick={() => navigate('/configuracoes-conta')} 
          className="p-2 -ml-2 text-[#616161]"
          aria-label={t('common.back')}
          title={t('common.back')}
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="text-sm font-semibold ml-2 text-[#2b2b2b]">{t('password.security')}</h1>
      </header>

      <div className="p-6 max-w-lg mx-auto">
        <div className="mb-10 text-left">
          <h2 className="text-3xl font-light text-[#2b2b2b] mb-3">{t('password.title')}</h2>
          <p className="text-sm text-[#616161]">{t('password.recommendation')}</p>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-[#e1e1e1] p-8 rounded-sm shadow-sm"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{t('password.old_label')}</label>
                <div className="relative">
                  <input
                    name="currentPassword"
                    type={showPass ? "text" : "password"}
                    className="input-field pr-10"
                    placeholder={t('password.old_placeholder')}
                    value={formData.currentPassword}
                    onChange={handleChange}
                  />
                  <Key className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{t('password.new_label')}</label>
                <div className="relative">
                  <input
                    name="newPassword"
                    type={showPass ? "text" : "password"}
                    className="input-field pr-10"
                    placeholder={t('password.new_placeholder')}
                    value={formData.newPassword}
                    onChange={handleChange}
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPass(!showPass)} 
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                    title={showPass ? "Ocultar senha" : "Mostrar senha"}
                    aria-label={showPass ? "Ocultar senha" : "Mostrar senha"}
                  >
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{t('password.confirm_label')}</label>
                <input
                  name="confirmPassword"
                  type={showPass ? "text" : "password"}
                  className="input-field"
                  placeholder={t('password.confirm_placeholder')}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="pt-4 space-y-4">
              <Button type="submit" className="w-full h-[45px]" isLoading={isSubmitting}>
                {t('password.btn_update')}
              </Button>
              <div className="flex items-center justify-center space-x-2 text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                <ShieldCheck size={14} className="text-ms-blue" />
                <span>{t('password.protection')}</span>
              </div>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
