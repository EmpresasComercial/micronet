import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ReceiptText, Info, Eye, EyeOff, Landmark } from 'lucide-react';
import { motion } from 'motion/react';
import { useToast } from '../components/Toast';
import { Button } from '../components/Button';
import { supabase } from '../lib/supabase';
import { formatCurrency } from '../lib/currency';

export default function Withdraw() {
  const navigate = useNavigate();
  const { showToast } = useToast();
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
    
    if (!isVerified) {
      showToast('Sua conta precisa estar verificada para realizar saques.', 'error');
      return;
    }

    if (!hasBank) {
      showToast('Por favor, cadastre uma conta bancária primeiro.', 'error');
      navigate('/adicionar-banco');
      return;
    }

    if (!password) {
      showToast('Por favor, insira sua senha de segurança.', 'error');
      return;
    }

    const withdrawAmount = parseInt(amount);

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
    return <div className="min-h-screen bg-[#f4f4f4] flex items-center justify-center text-gray-400">Carregando...</div>;
  }

  return (
    <div className="min-h-screen bg-[#f4f4f4]">
      <header className="bg-white p-4 flex items-center justify-between border-b border-gray-200 sticky top-0 z-50">
        <div className="flex items-center">
          <button 
            onClick={() => navigate('/perfil')} 
            className="p-1 text-gray-600 hover:text-ms-blue transition-colors"
            title="Voltar ao perfil"
            aria-label="Voltar ao perfil"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="text-sm font-bold ml-4 text-gray-800">Solicitar Retirada</h1>
        </div>
        <button 
          onClick={() => navigate('/registro-retirada')} 
          className="p-1 text-gray-400 hover:text-ms-blue"
          title="Histórico de retiradas"
          aria-label="Histórico de retiradas"
        >
          <ReceiptText className="w-6 h-6" />
        </button>
      </header>

      <main className="p-6 flex flex-col items-center">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md bg-white p-8 shadow-sm border border-gray-100 rounded-sm"
        >
          {/* Logo Microsoft */}
          <div className="flex mb-8">
            <img 
              src="https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg" 
              alt="Microsoft" 
              className="h-5"
              referrerPolicy="no-referrer"
            />
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Valor */}
            <div>
              <label className="block text-[10px] font-black text-gray-500 uppercase tracking-wider mb-2">Valor da Retirada</label>
              <input 
                type="text" 
                placeholder="Introduzir valor (Mín. 3.000 Kz)"
                className="w-full py-3 text-sm border-b border-gray-200 focus:border-ms-blue outline-none transition-colors placeholder:text-gray-300"
                value={amount}
                onChange={handleAmountChange}
              />
            </div>

            {/* Conta Bancária */}
            <div onClick={() => !hasBank && navigate('/adicionar-banco')} className="cursor-pointer">
              <label className="block text-[10px] font-black text-gray-500 uppercase tracking-wider mb-2">Conta Bancária</label>
              <div className="relative group">
                <select 
                  className="w-full py-3 text-sm border-b border-gray-200 focus:border-ms-blue outline-none bg-transparent appearance-none cursor-pointer"
                  disabled={!hasBank}
                  defaultValue={hasBank ? "default" : "none"}
                  title="Selecionar conta bancária"
                  aria-label="Selecionar conta bancária"
                >
                  {hasBank ? (
                    <option value="default">{bankName}</option>
                  ) : (
                    <option value="none">Vincular conta bancária</option>
                  )}
                </select>
                <div className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none text-gray-300">
                  <ChevronLeft className="w-4 h-4 -rotate-90" />
                </div>
              </div>
            </div>

            {/* Senha */}
            <div>
              <label className="block text-[10px] font-black text-gray-500 uppercase tracking-wider mb-2">Senha de Segurança</label>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"} 
                  placeholder="Introduzir senha de login"
                  className="w-full py-3 text-sm border-b border-gray-200 focus:border-ms-blue outline-none transition-colors placeholder:text-gray-300"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-600"
                  title={showPassword ? "Ocultar senha" : "Mostrar senha"}
                  aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Resumo */}
            <div className="bg-[#f8f8f8] p-4 rounded-sm space-y-3">
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-gray-400 font-medium tracking-tight">Taxa de Serviço (14%)</span>
                <span className="text-red-500 font-bold">-{formatCurrency(calculateTax(), 'KZ')}</span>
              </div>
              <div className="flex justify-between items-center text-[13px] pt-2 border-t border-gray-100">
                <span className="text-gray-800 font-black tracking-tight uppercase">Total Líquido</span>
                <span className="text-ms-blue font-black">{formatCurrency(calculateNet(), 'KZ')}</span>
              </div>
            </div>

            <Button type="submit" isLoading={isSubmitting} className="w-full h-12 text-sm font-bold shadow-none">
              Solicitar
            </Button>
          </form>
        </motion.div>
      </main>
    </div>
  );
}
