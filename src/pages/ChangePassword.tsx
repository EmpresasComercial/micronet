import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Key, ShieldCheck, Eye, EyeOff } from 'lucide-react';
import { motion } from 'motion/react';
import { useToast } from '../components/Toast';
import { Button } from '../components/Button';
import { useLanguage } from '../contexts/LanguageContext';
import { supabase } from '../lib/supabase';

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
    // Sanitização: Remove espaços em branco em tempo real
    const val = e.target.value.replace(/\s/g, '');
    setFormData({ ...formData, [e.target.name]: val });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.newPassword.length < 6) {
      showToast('A nova senha deve ter pelo menos 6 caracteres.', 'error');
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      showToast('As novas senhas não coincidem.', 'error');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const { error } = await supabase.auth.updateUser({
        password: formData.newPassword
      });

      if (error) throw error;

      showToast('Senha atualizada com sucesso!', 'success');
      setTimeout(() => navigate('/configuracoes-conta'), 1500);
    } catch (err: any) {
      showToast(err.message || 'Erro ao atualizar senha.', 'error');
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
          aria-label="Voltar para configurações"
          title="Voltar"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="text-sm font-semibold ml-2 text-[#2b2b2b]">Segurança da Conta</h1>
      </header>

      <div className="p-6 max-w-lg mx-auto">
        <div className="mb-10 text-left">
          <h2 className="text-3xl font-light text-[#2b2b2b] mb-3">Alterar Senha</h2>
          <p className="text-sm text-[#616161]">Recomendamos o uso de letras e números para maior segurança.</p>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-[#e1e1e1] p-8 rounded-sm shadow-sm"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Senha Atual</label>
                <div className="relative">
                  <input
                    name="currentPassword"
                    type={showPass ? "text" : "password"}
                    className="input-field pr-10"
                    placeholder="Introduza a senha atual"
                    value={formData.currentPassword}
                    onChange={handleChange}
                  />
                  <Key className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Nova Senha</label>
                <div className="relative">
                  <input
                    name="newPassword"
                    type={showPass ? "text" : "password"}
                    className="input-field pr-10"
                    placeholder="Mínimo 6 caracteres"
                    value={formData.newPassword}
                    onChange={handleChange}
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Confirmar Nova Senha</label>
                <input
                  name="confirmPassword"
                  type={showPass ? "text" : "password"}
                  className="input-field"
                  placeholder="Repita a nova senha"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="pt-4 space-y-4">
              <Button type="submit" className="w-full h-[45px]" isLoading={isSubmitting}>
                Atualizar Senha
              </Button>
              <div className="flex items-center justify-center space-x-2 text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                <ShieldCheck size={14} className="text-ms-blue" />
                <span>Proteção Criptografada</span>
              </div>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
