import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Wallet, Landmark, Info, ShieldCheck, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { useToast } from '../components/Toast';
import { Button } from '../components/Button';
import { useLanguage } from '../contexts/LanguageContext';
import { supabase } from '../lib/supabase';
import { formatCurrency } from '../lib/currency';

export default function Withdraw() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { t } = useLanguage();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [balance, setBalance] = useState(0);
  const [amount, setAmount] = useState('');
  const [hasBank, setHasBank] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const { data, error } = await supabase.rpc('get_withdraw_info_mcpn');
        if (error) throw error;
        if (data && data.length > 0) {
          setBalance(Number(data[0].balance));
          setHasBank(data[0].has_bank);
        }
      } catch (err: any) {
        console.error('Erro ao buscar dados:', err.message);
      }
    }
    fetchData();
  }, []);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Sanitização: Apenas números
    const val = e.target.value.replace(/\D/g, '');
    setAmount(val);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const withdrawAmount = parseInt(amount);

    if (!hasBank) {
      showToast('Por favor, cadastre uma conta bancária primeiro.', 'error');
      navigate('/adicionar-banco');
      return;
    }

    if (!amount || withdrawAmount < 2000) {
      showToast('O valor mínimo de saque é 2.000 Kz.', 'error');
      return;
    }

    if (withdrawAmount > balance) {
      showToast('Saldo insuficiente para este levantamento.', 'error');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const { data, error } = await supabase.rpc('process_withdrawal_request', {
        p_amount: withdrawAmount
      });

      if (error) throw error;

      if (data.success) {
        showToast('Solicitação de saque enviada! Aguarde o processamento.', 'success');
        navigate('/perfil');
      } else {
        showToast(data.message, 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Erro ao processar saque.', 'error');
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
        <h1 className="text-sm font-semibold ml-2 text-[#2b2b2b]">Levantamento</h1>
      </header>

      <div className="p-6 max-w-lg mx-auto">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-ms-blue text-white p-8 rounded-sm shadow-lg mb-8 relative overflow-hidden"
        >
          <div className="relative z-10">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-80 mb-1">Saldo Disponível</p>
            <h2 className="text-4xl font-light tracking-tight">{formatCurrency(balance, 'KZ')}</h2>
          </div>
          <Wallet className="absolute right-[-20px] bottom-[-20px] w-40 h-40 text-white opacity-10 rotate-12" />
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-[#e1e1e1] p-8 rounded-sm shadow-sm"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Valor do Saque (Kz)</label>
              <div className="relative">
                <input
                  type="text"
                  className="input-field text-2xl font-light h-16"
                  placeholder="0.00"
                  value={amount}
                  onChange={handleAmountChange}
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 font-bold">AOA</span>
              </div>
              <p className="text-[9px] text-gray-400 mt-2 font-bold uppercase tracking-wider flex items-center">
                <Info size={10} className="mr-1" /> Mínimo: 2.000 Kz | Taxa: 5%
              </p>
            </div>

            {!hasBank && (
              <div className="bg-red-50 border border-red-100 p-4 rounded flex items-start space-x-3">
                <AlertCircle className="text-red-500 shrink-0" size={18} />
                <p className="text-[11px] text-red-700 font-medium">Você ainda não vinculou uma conta bancária para receber seus fundos.</p>
              </div>
            )}

            <div className="pt-4 space-y-4">
              <Button type="submit" className="w-full h-14 text-base" isLoading={isSubmitting}>
                Solicitar Levantamento
              </Button>
              <div className="flex items-center justify-center space-x-2 text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                <ShieldCheck size={14} className="text-ms-blue" />
                <span>Processamento em até 24h</span>
              </div>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
