import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Wallet, Landmark, Info, ShieldCheck, AlertCircle, ReceiptText, Clock } from 'lucide-react';
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
  const [bankName, setBankName] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const { data, error } = await supabase.rpc('get_withdraw_info_mcpn');
        if (error) throw error;
        if (data && data.length > 0) {
          setBalance(Number(data[0].balance));
          setHasBank(data[0].has_bank);
          setBankName(data[0].bank_name || '');
          setIsVerified(data[0].is_verified);
        }
      } catch (err: any) {
        console.error('Erro ao buscar dados:', err.message);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '');
    setAmount(val);
  };

  const calculateNet = () => {
    const val = parseInt(amount) || 0;
    const tax = val * 0.14; // Taxa atual de 14% mantida como "lógica"
    return val - tax;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isVerified) {
      showToast('Sua conta precisa estar verificada para realizar saques.', 'error');
      return;
    }

    if (!hasBank) {
      showToast('Por favor, cadastre uma conta bancária primeiro.', 'error');
      navigate('/adicionar-banco');
      return;
    }

    const withdrawAmount = parseInt(amount);

    if (!amount || withdrawAmount < 3000) {
      showToast('O valor mínimo de saque é 3.000 Kz.', 'error');
      return;
    }

    if (withdrawAmount > balance) {
      showToast('Saldo insuficiente para este levantamento.', 'error');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const { data, error } = await supabase.rpc('process_withdrawal_request', {
        p_amount: withdrawAmount,
        p_bank_id: 'default'
      });

      if (error) throw error;

      if (data.success) {
        showToast(data.message, 'success');
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

  if (isLoading) {
    return <div className="min-h-screen bg-[#f2f2f2] flex items-center justify-center italic text-gray-400 uppercase tracking-widest text-[10px]">Carregando...</div>;
  }

  return (
    <div className="min-h-screen bg-[#f2f2f2]">
      <header className="bg-white p-4 flex items-center border-b border-[#e1e1e1] sticky top-0 z-50">
        <button 
          onClick={() => navigate('/perfil')} 
          className="p-2 -ml-2 text-gray-600 hover:text-ms-blue transition-colors"
          aria-label="Voltar"
          title="Voltar"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="text-sm font-semibold ml-2 text-[#2b2b2b]">Levantamento</h1>
        <button 
          onClick={() => navigate('/registro-retirada')}
          className="ml-auto p-2 text-gray-400 hover:text-ms-blue transition-colors"
          title="Histórico de Levantamentos"
        >
          <ReceiptText className="w-6 h-6" strokeWidth={1.5} />
        </button>
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

        {!isVerified && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-amber-50 border border-amber-100 p-4 rounded-sm mb-6 flex items-start space-x-3"
          >
            <ShieldCheck className="text-amber-600 shrink-0" size={18} />
            <div>
              <p className="text-[11px] text-amber-900 font-bold uppercase">Verificação Necessária</p>
              <p className="text-[10px] text-amber-800 mt-0.5">Sua conta precisa estar verificada (BI Aprovado) para saques.</p>
            </div>
          </motion.div>
        )}

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-[#e1e1e1] p-8 rounded-sm shadow-sm"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Valor do Saque (Kz)</label>
              <div className="relative border-b-2 border-ms-blue">
                <input
                  type="text"
                  className="w-full bg-transparent text-2xl font-light h-16 focus:outline-none"
                  placeholder="0.00"
                  value={amount}
                  onChange={handleAmountChange}
                  disabled={!isVerified}
                />
                <span className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-300 font-bold">AOA</span>
              </div>
              
              <div className="mt-4 grid grid-cols-2 gap-4 border-t border-gray-100 pt-4">
                <div>
                  <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Taxa (14%)</p>
                  <p className="text-xs font-medium text-red-600">-{formatCurrency(parseInt(amount || '0') * 0.14, 'KZ')}</p>
                </div>
                <div>
                  <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Líquido</p>
                  <p className="text-xs font-bold text-ms-blue">{formatCurrency(calculateNet(), 'KZ')}</p>
                </div>
              </div>

              <p className="text-[9px] text-gray-400 mt-4 font-bold uppercase tracking-wider flex items-center">
                <Info size={10} className="mr-1" /> Mínimo: 3.000 Kz | Saques: Seg-Sex (10h-16h)
              </p>
            </div>

            <div className="bg-[#f9f9f9] p-4 rounded-sm border border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center">
                  <Landmark size={12} className="mr-2" /> Conta Destino
                </p>
                {hasBank && (
                  <button type="button" onClick={() => navigate('/adicionar-banco')} className="text-[10px] font-bold text-ms-blue uppercase underline">
                    Trocar
                  </button>
                )}
              </div>
              {hasBank ? (
                <p className="text-xs font-medium text-gray-700">{bankName}</p>
              ) : (
                <button 
                  type="button"
                  onClick={() => navigate('/adicionar-banco')}
                  className="flex items-center text-xs font-bold text-red-500 py-1"
                >
                  <AlertCircle size={14} className="mr-2" /> Vincular Conta Bancária
                </button>
              )}
            </div>

            <div className="pt-4">
              <Button 
                type="submit" 
                className="w-full h-14 text-sm font-bold uppercase tracking-widest" 
                isLoading={isSubmitting}
                disabled={!isVerified || !hasBank || parseInt(amount || '0') < 3000}
              >
                Confirmar Levantamento
              </Button>
            </div>

            <div className="bg-blue-50/50 p-3 flex items-start space-x-3 border border-blue-100/50">
              <ShieldCheck size={16} className="text-ms-blue shrink-0 mt-0.5" />
              <p className="text-[9px] text-ms-blue/70 leading-relaxed font-medium uppercase tracking-tight">
                Processamento Seguro Microsoft Cloud. O prazo de compensação bancária varia de 30min a 24h úteis.
              </p>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
