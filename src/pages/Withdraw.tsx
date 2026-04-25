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
    const tax = val * 0.14;
    return val - tax;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isVerified) {
      showToast('Sua conta precisa estar verificada (BI Aprovado) para realizar saques.', 'error');
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
        p_bank_id: 'default', // ID mantido por compatibilidade
        p_password: 'N/A'     // Password removido por segurança (auth.uid() é suficiente)
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
    return <div className="min-h-screen bg-ms-gray flex items-center justify-center">Carregando...</div>;
  }

  return (
    <div className="min-h-screen bg-ms-gray">
      <header className="bg-white p-4 flex items-center border-b border-ms-border sticky top-0 z-50">
        <button 
          onClick={() => navigate('/perfil')} 
          className="p-2 -ml-2 text-ms-text-muted hover:text-ms-blue transition-colors"
          title="Voltar ao perfil"
          aria-label="Voltar ao perfil"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="text-sm font-semibold ml-2 text-ms-text">Levantamento de Fundos</h1>
        <button 
          onClick={() => navigate('/registro-retirada')}
          className="ml-auto p-2 text-ms-text-muted hover:text-ms-blue"
          title="Histórico de Retiradas"
          aria-label="Histórico de Retiradas"
        >
          <ReceiptText className="w-6 h-6" strokeWidth={1.5} />
        </button>
      </header>

      <div className="p-4 max-w-lg mx-auto pb-20">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-ms-blue text-white p-6 rounded-sm mb-4 relative overflow-hidden"
        >
          <div className="relative z-10">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-80 mb-1">Disponível para Saque</p>
            <h2 className="text-3xl font-light tracking-tight">{formatCurrency(balance, 'KZ')}</h2>
          </div>
          <Wallet className="absolute right-[-10px] bottom-[-10px] w-32 h-32 text-white opacity-10 rotate-12" />
        </motion.div>

        {!isVerified && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-amber-50 border border-amber-200 p-4 rounded-sm mb-4 flex items-start space-x-3"
          >
            <ShieldCheck className="text-amber-600 shrink-0" size={20} />
            <div>
              <p className="text-[12px] text-amber-900 font-bold">Verificação Necessária</p>
              <p className="text-[11px] text-amber-800 mt-1">Para sua segurança, os saques estão bloqueados até que sua verificação de BI seja aprovada.</p>
              <button 
                onClick={() => navigate('/verificacao')}
                className="mt-3 text-[11px] font-bold text-amber-900 underline uppercase tracking-wider"
              >
                Verificar Documentos Agora
              </button>
            </div>
          </motion.div>
        )}

        <div className="bg-white border border-ms-border p-6 rounded-sm">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-[10px] font-bold text-ms-text-muted uppercase tracking-widest mb-2">Quanto deseja retirar?</label>
              <div className="relative">
                <input
                  type="text"
                  className="w-full bg-ms-gray border-b-2 border-ms-blue text-2xl font-light h-14 px-0 focus:outline-none"
                  placeholder="0.00"
                  value={amount}
                  onChange={handleAmountChange}
                  disabled={!isVerified}
                />
                <span className="absolute right-0 top-1/2 -translate-y-1/2 text-ms-text-muted text-xs font-bold">KWANZA</span>
              </div>
              
              <div className="mt-4 grid grid-cols-2 gap-4 border-t border-ms-border pt-4">
                <div>
                  <p className="text-[9px] text-ms-text-muted font-bold uppercase tracking-wider">Taxa de Saque (14%)</p>
                  <p className="text-sm font-medium text-red-600">-{formatCurrency(parseInt(amount || '0') * 0.14, 'KZ')}</p>
                </div>
                <div>
                  <p className="text-[9px] text-ms-text-muted font-bold uppercase tracking-wider">Valor Líquido</p>
                  <p className="text-sm font-bold text-ms-blue">{formatCurrency(calculateNet(), 'KZ')}</p>
                </div>
              </div>
            </div>

            <div className="bg-ms-gray p-4 rounded-sm">
              <div className="flex items-center justify-between mb-2">
                <p className="text-[10px] font-bold text-ms-text-muted uppercase tracking-widest flex items-center">
                  <Landmark size={12} className="mr-2" /> Conta Destino
                </p>
                {hasBank && (
                  <button type="button" onClick={() => navigate('/adicionar-banco')} className="text-[10px] font-bold text-ms-blue uppercase underline">
                    Trocar
                  </button>
                )}
              </div>
              {hasBank ? (
                <p className="text-xs font-medium text-ms-text">{bankName}</p>
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

            <div className="flex items-center text-[10px] text-ms-text-muted font-bold uppercase tracking-wider">
              <Clock size={12} className="mr-2 text-ms-blue" />
              Saques: Segunda a Sexta | 10:00 - 16:00
            </div>

            <Button 
              type="submit" 
              className="w-full h-14 text-sm font-bold uppercase tracking-widest rounded-none shadow-none" 
              isLoading={isSubmitting}
              disabled={!isVerified || !hasBank || parseInt(amount || '0') < 3000}
            >
              Confirmar Levantamento
            </Button>

            <div className="bg-ms-gray p-3 flex items-start space-x-3">
              <Info size={16} className="text-ms-blue shrink-0 mt-0.5" />
              <p className="text-[10px] text-ms-text-muted leading-relaxed">
                O processamento de levantamentos bancários pode levar de 30 minutos a 24 horas úteis, dependendo do tempo de compensação do banco.
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
