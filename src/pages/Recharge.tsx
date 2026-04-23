import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Landmark, Info, ShieldCheck, CreditCard } from 'lucide-react';
import { motion } from 'motion/react';
import { useToast } from '../components/Toast';
import { Button } from '../components/Button';
import { useLanguage } from '../contexts/LanguageContext';
import { supabase } from '../lib/supabase';

export default function Recharge() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { t } = useLanguage();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [amount, setAmount] = useState('');

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Sanitização: Apenas números
    const val = e.target.value.replace(/\D/g, '');
    setAmount(val);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const rechargeAmount = parseInt(amount);

    if (!amount || rechargeAmount < 9000) {
      showToast('O valor mínimo de recarga é 9.000 Kz.', 'error');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const { data, error } = await supabase.rpc('request_recharge_kz_mcpn', {
        p_amount: rechargeAmount
      });

      if (error) throw error;

      if (data.success) {
        // Redireciona para a página de confirmação (onde o usuário envia o comprovativo)
        navigate(`/confirmar-recarga?id=${data.recharge_id}&amount=${rechargeAmount}`);
      } else {
        showToast(data.message, 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Erro ao processar recarga.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f2f2f2]">
      <header className="bg-white p-4 flex items-center border-b border-[#e1e1e1] sticky top-0 z-50">
        <button 
          onClick={() => navigate('/home')} 
          className="p-2 -ml-2 text-gray-600 hover:text-ms-blue transition-colors"
          aria-label="Voltar para a home"
          title="Voltar"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="text-sm font-semibold ml-2 text-[#2b2b2b]">Recarga de Conta</h1>
      </header>

      <div className="p-6 max-w-lg mx-auto">
        <div className="mb-10 text-left">
          <h2 className="text-3xl font-light text-[#2b2b2b] mb-3">Adicionar Saldo</h2>
          <p className="text-sm text-[#616161]">Selecione o montante que deseja carregar via transferência bancária.</p>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-[#e1e1e1] p-8 rounded-sm shadow-sm"
        >
          <form onSubmit={handleSubmit} className="space-y-8">
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Montante (AOA)</label>
              <div className="relative">
                <input
                  type="text"
                  className="input-field text-2xl font-light h-16"
                  placeholder="0.00"
                  value={amount}
                  onChange={handleAmountChange}
                />
                <Landmark className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300" size={24} />
              </div>
              
              <div className="grid grid-cols-3 gap-2 mt-4">
                {[10000, 50000, 100000].map(val => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setAmount(val.toString())}
                    className="p-3 border border-gray-200 rounded-sm text-xs font-bold hover:bg-gray-50 transition-colors"
                  >
                    {val.toLocaleString()} Kz
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-blue-50/50 border border-blue-100 p-6 rounded-sm space-y-3">
              <div className="flex items-center space-x-2 text-ms-blue">
                <Info size={16} />
                <span className="text-xs font-bold uppercase tracking-wider">Instruções</span>
              </div>
              <p className="text-[11px] text-gray-600 leading-relaxed font-medium">
                Após clicar em "Continuar", você receberá os dados bancários para a transferência. Guarde o comprovativo para validação.
              </p>
            </div>

            <div className="pt-4 space-y-4">
              <Button type="submit" className="w-full h-14" isLoading={isSubmitting}>
                Continuar para Pagamento
              </Button>
              <div className="flex items-center justify-center space-x-2 text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                <ShieldCheck size={14} className="text-green-600" />
                <span>Transação Segura Microsoft</span>
              </div>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
