import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ReceiptText, Info, Eye, EyeOff, Landmark } from 'lucide-react';
import { motion } from 'motion/react';
import { useToast } from '../components/Toast';
import { Button } from '../components/Button';
import { supabase } from '../lib/supabase';
import { formatCurrency } from '../lib/currency';
import { useLanguage } from '../contexts/LanguageContext';

export default function Withdraw() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { t } = useLanguage();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [balance, setBalance] = useState(0);
  const [amount, setAmount] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [hasBank, setHasBank] = useState(false);
  const [bankName, setBankName] = useState('');
  const [bankId, setBankId] = useState<string | null>(null);
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
          setBankId(data[0].bank_id || null);
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

  const calculateTax = () => {
    const val = parseInt(amount) || 0;
    return val * 0.14;
  };

  const calculateNet = () => {
    const val = parseInt(amount) || 0;
    return val - calculateTax();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const withdrawAmount = parseInt(amount);

    // Time Check
    const now = new Date();
    const hour = now.getHours();
    if (hour < 10 || hour >= 16) {
      showToast(t('withdraw.time_error'), 'error');
      return;
    }

    if (!isVerified) {
      showToast(t('withdraw.verify_required'), 'error');
      navigate('/autenticacao');
      return;
    }

    if (!hasBank) {
      showToast(t('withdraw.bank_required'), 'error');
      navigate('/adicionar-banco');
      return;
    }

    if (!password) {
      showToast(t('auth.password_error_empty'), 'error');
      return;
    }

    if (!amount || withdrawAmount < 3000) {
      showToast('O valor mínimo de saque é 3.000 Kz.', 'error');
      return;
    }

    if (withdrawAmount > balance) {
      showToast('Saldo insuficiente.', 'error');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Verificar a senha de login re-autenticando
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user?.email) throw new Error('Sessão expirada.');

      const { error: authError } = await supabase.auth.signInWithPassword({
        email: userData.user.email,
        password: password,
      });

      if (authError) {
        showToast(t('auth.password_error_wrong'), 'error');
        setIsSubmitting(false);
        return;
      }

      const { data, error } = await supabase.rpc('process_withdrawal_request', {
        p_amount: withdrawAmount,
        p_bank_id: bankId,
        p_password: password
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
    return <div className="min-h-screen bg-[#f4f4f4] flex items-center justify-center text-gray-400 font-bold italic uppercase tracking-widest">{t('common.loading')}</div>;
  }

  return (
    <div className="min-h-screen bg-[#f8f9fa]">
      <header className="bg-white px-[4px] h-14 flex items-center justify-between sticky top-0 z-50 border-b border-gray-100">
        <div className="flex items-center">
          <button 
            onClick={() => navigate('/perfil')} 
            className="p-3 text-gray-800"
            title="Voltar"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-black text-gray-900 tracking-tight ml-1">Retirada</h1>
        </div>
        <button 
          onClick={() => navigate('/registro-retirada')} 
          className="p-3 text-gray-400"
          title="Histórico"
        >
          <ReceiptText className="w-6 h-6" />
        </button>
      </header>

      <main className="px-[4px] py-4 space-y-[4px]">
        {/* Balance Card */}
        <div className="bg-white p-6 border border-gray-100 flex items-center justify-between">
           <div className="flex flex-col">
              <span className="text-[10px] font-black text-gray-400 tracking-widest uppercase mb-1">{t('profile.balance')}</span>
              <span className="text-2xl font-black text-ms-blue tracking-tight">{formatCurrency(balance, 'KZ')}</span>
           </div>
           <div className="w-12 h-12 bg-blue-50 flex items-center justify-center">
              <Landmark className="text-ms-blue" size={24} />
           </div>
        </div>

        <div className="bg-white p-8 border border-gray-100 space-y-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Hour Restriction Info */}
            <div className="bg-orange-50/50 border border-orange-100 p-4 flex items-start space-x-3">
              <Info size={16} className="text-orange-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-[10px] font-black text-orange-600 uppercase tracking-widest leading-none mb-1">Horário de Saque</p>
                <p className="text-[11px] text-orange-600/70 font-medium leading-relaxed">Os saques são processados diariamente das 10h às 16h (Horário de Luanda).</p>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black text-gray-400 tracking-widest mb-1">{t('withdraw.amount')}</label>
              <input 
                type="text" 
                placeholder={t('withdraw.amount_placeholder')}
                className="w-full py-3 text-sm border-b border-gray-200 focus:border-ms-blue outline-none transition-colors placeholder:text-gray-300 font-bold"
                value={amount}
                onChange={handleAmountChange}
              />
            </div>

            <div onClick={() => !hasBank && navigate('/adicionar-banco')} className="cursor-pointer">
              <label className="block text-[10px] font-black text-gray-400 tracking-widest mb-1">{t('withdraw.bank_acc')}</label>
              <div className="relative group border-b border-gray-200">
                <div className="py-3 text-sm font-bold text-gray-700">
                   {hasBank ? bankName : t('bank.bind')}
                </div>
                <div className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-300">
                  <ChevronLeft className="w-4 h-4 -rotate-90" />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black text-gray-400 tracking-widest mb-1">{t('withdraw.password')}</label>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"} 
                  placeholder={t('withdraw.security_pass_placeholder')}
                  className="w-full py-3 text-sm border-b border-gray-200 focus:border-ms-blue outline-none transition-colors placeholder:text-gray-300"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-300"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="bg-[#f8f9fa] p-5 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black text-gray-400 tracking-widest uppercase">{t('withdraw.tax')}</span>
                <span className="text-xs font-black text-red-500">-{formatCurrency(calculateTax(), 'KZ')}</span>
              </div>
              <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                <span className="text-[10px] font-black text-gray-800 tracking-widest uppercase">{t('withdraw.total_net')}</span>
                <span className="text-lg font-black text-ms-blue">{formatCurrency(calculateNet(), 'KZ')}</span>
              </div>
            </div>

            <Button type="submit" isLoading={isSubmitting} className="w-full h-14 text-xs font-black uppercase tracking-[0.2em] shadow-lg shadow-ms-blue/20">
              {t('withdraw.btn_request')}
            </Button>
          </form>
        </div>
      </main>
    </div>
  );
}
