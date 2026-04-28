import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff, ShieldCheck, Phone, Key, UserPlus } from 'lucide-react';
import { motion } from 'motion/react';
import { useToast } from '../components/Toast';
import { Button } from '../components/Button';
import { useLanguage } from '../contexts/LanguageContext';
import { LanguageSelector } from '../components/LanguageSelector';
import { supabase } from '../lib/supabase';
import { cn } from '@/src/lib/utils';

export default function Signup() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { showToast } = useToast();
  const { t } = useLanguage();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    phone: '',
    inviteCode: '',
    password: '',
    confirmPassword: ''
  });

  useEffect(() => {
    const code = searchParams.get('join');
    if (code) {
      setFormData(prev => ({ ...prev, inviteCode: code.toUpperCase() }));
    }
  }, [searchParams]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let sanitized = value;

    if (name === 'phone' || name === 'inviteCode') {
      sanitized = value.replace(/\D/g, '').slice(0, name === 'phone' ? 9 : 10);
    } else {
      sanitized = value.trim();
    }

    setFormData(prev => ({ ...prev, [name]: sanitized }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.phone || !formData.phone.startsWith('9') || formData.phone.length !== 9) {
      showToast(t('auth.phone_error_length'), 'error');
      return;
    }

    if (formData.password.length < 6) {
      showToast(t('auth.password_error_length'), 'error');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      showToast(t('password.match_error'), 'error');
      return;
    }

    if (!formData.inviteCode || formData.inviteCode.length !== 10) {
      showToast('O código de convite deve ter 10 dígitos numéricos.', 'error');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // 1. Validar convite e telefone via RPC antes de criar conta no Auth
      // Isso evita criar usuários órfãos se os dados de negócio forem inválidos
      const { data: validation, error: vError } = await supabase.rpc('secure_registration_mcpn', {
        p_phone: formData.phone,
        p_invite_code: formData.inviteCode.toUpperCase()
      });

      if (vError) throw vError;
      
      if (validation && !validation.success) {
        showToast(validation.message || 'Dados de convite inválidos.', 'error');
        setIsSubmitting(false);
        return;
      }

      // 2. Prosseguir com o cadastro no Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email: `${formData.phone}@user.com`,
        password: formData.password,
        options: {
          data: {
            phone: formData.phone,
            referred_by: formData.inviteCode.toUpperCase(),
            ip_address: 'angola_node'
          }
        }
      });

      if (error) {
        if (error.message.includes('already registered')) {
          showToast(t('auth.phone_error_exists') || 'Este número já está registrado.', 'error');
        } else {
          throw error;
        }
        return;
      }

      if (data.user) {
        showToast(t('auth.signup_success') || 'Conta criada com sucesso!', 'success');
        navigate('/home');
      }
    } catch (err: any) {
      console.error('Signup error:', err);
      showToast(err.message || 'Falha ao processar registo.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white md:bg-[#f2f2f2] flex flex-col relative">
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="absolute top-4 right-4 z-[100]">
          <LanguageSelector />
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-[440px] bg-white p-8 md:p-12 md:shadow-2xl border-0 md:border border-gray-100"
        >
          <div className="mb-10">
            <img 
              src="https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg" 
              alt="Microsoft" 
              className="h-6 mb-10"
              referrerPolicy="no-referrer"
            />
            <h1 className="text-2xl font-semibold tracking-tight">{t('auth.signup_title')}</h1>
            <p className="text-sm text-gray-500 mt-2">{t('auth.signup')}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="relative">
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{t('auth.phone_label')}</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xs">+244</span>
                  <input
                    name="phone"
                    type="tel"
                    placeholder={t('auth.phone_placeholder')}
                    className="input-field pl-14"
                    value={formData.phone}
                    onChange={handleChange}
                    maxLength={9}
                  />
                  <Phone className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{t('auth.invite_code')}</label>
                <div className="relative">
                  <input
                    name="inviteCode"
                    type="tel"
                    placeholder="0000000000"
                    className={cn(
                      "input-field pr-10 font-mono tracking-[0.2em] text-center",
                      formData.inviteCode && "text-ms-blue border-ms-blue/30 bg-blue-50/30"
                    )}
                    value={formData.inviteCode}
                    onChange={handleChange}
                    maxLength={10}
                  />
                  <UserPlus className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{t('auth.password_label')}</label>
                <div className="relative">
                  <input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder={t('auth.password_signup_placeholder')}
                    className="input-field pr-10"
                    value={formData.password}
                    onChange={handleChange}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                    aria-label={t('auth.enter_password')}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{t('password.confirm_label')}</label>
                <div className="relative">
                  <input
                    name="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    placeholder={t('password.confirm_placeholder')}
                    className="input-field pr-10"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                  />
                  <Key className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
                </div>
              </div>
            </div>

            <div className="pt-4 flex flex-col space-y-4">
              <Button
                type="submit"
                className="w-full h-[45px]"
                isLoading={isSubmitting}
              >
                {t('auth.btn_register')}
              </Button>
              
              <div className="flex items-center justify-center space-x-2 text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                <ShieldCheck size={14} className="text-green-600" />
                <span>Proteção Microsoft Exchange</span>
              </div>

              <div className="text-center pt-4 border-t border-gray-100">
                <p className="text-sm text-gray-600">
                  {t('auth.has_account')} <Link to="/login" className="text-ms-blue font-bold hover:underline">{t('auth.login')}</Link>
                </p>
              </div>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
