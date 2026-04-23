import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Ticket, ShieldCheck, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import { useToast } from '../components/Toast';
import { Button } from '../components/Button';
import { useLanguage } from '../contexts/LanguageContext';
import { supabase } from '../lib/supabase';

export default function RedeemCoupon() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { t } = useLanguage();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [coupon, setCoupon] = useState('');

  const handleCouponChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Sanitização: Apenas letras e números, tudo em maiúsculas
    const val = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    setCoupon(val);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!coupon || coupon.length < 5) {
      showToast('Por favor, insira um código de cupom válido.', 'error');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const { data, error } = await supabase.rpc('redeem_coupon_mcpn', {
        p_coupon_code: coupon
      });

      if (error) throw error;

      if (data.success) {
        showToast(`Sucesso! Você recebeu ${data.amount} Kz de bônus.`, 'success');
        navigate('/perfil');
      } else {
        showToast(data.message, 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Erro ao resgatar cupom.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f2f2f2]">
      <header className="bg-white p-4 flex items-center border-b border-[#e1e1e1] sticky top-0 z-50">
        <button 
          onClick={() => navigate('/perfil')} 
          className="p-2 -ml-2 text-gray-600 hover:text-ms-blue transition-colors"
          aria-label="Voltar para o perfil"
          title="Voltar"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="text-sm font-semibold ml-2 text-[#2b2b2b]">Resgate de Cupom</h1>
      </header>

      <div className="p-6 max-w-lg mx-auto">
        <div className="mb-10 text-left">
          <h2 className="text-3xl font-light text-[#2b2b2b] mb-3">Ativar Bônus</h2>
          <p className="text-sm text-[#616161]">Insira o código promocional fornecido pelo seu gerente ou nos grupos oficiais.</p>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-[#e1e1e1] p-8 rounded-sm shadow-sm"
        >
          <form onSubmit={handleSubmit} className="space-y-8">
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Código do Cupom</label>
              <div className="relative">
                <input
                  type="text"
                  className="input-field text-xl font-bold tracking-[0.3em] text-center h-16 border-ms-blue/30"
                  placeholder="EXEM-PLO20"
                  value={coupon}
                  onChange={handleCouponChange}
                  maxLength={15}
                />
                <Ticket className="absolute left-4 top-1/2 -translate-y-1/2 text-ms-blue opacity-20" size={24} />
              </div>
            </div>

            <div className="bg-purple-50/50 border border-purple-100 p-6 rounded-sm flex items-start space-x-4">
              <Sparkles className="text-purple-600 shrink-0" size={20} />
              <p className="text-[11px] text-purple-900 font-medium leading-relaxed">
                Cada código pode ser usado apenas uma vez por conta. Verifique a validade com o suporte oficial.
              </p>
            </div>

            <div className="pt-4 space-y-4">
              <Button type="submit" className="w-full h-14" isLoading={isSubmitting}>
                Resgatar Agora
              </Button>
              <div className="flex items-center justify-center space-x-2 text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                <ShieldCheck size={14} className="text-ms-blue" />
                <span>Validação em Tempo Real</span>
              </div>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
