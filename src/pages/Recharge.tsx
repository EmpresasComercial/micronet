import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Landmark, Info, ShieldCheck, CreditCard, CheckCircle2, X, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useToast } from '../components/Toast';
import { Button } from '../components/Button';
import { useLanguage } from '../contexts/LanguageContext';
import { supabase } from '../lib/supabase';
import { cn } from '../lib/utils';

export default function Recharge() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { t } = useLanguage();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [amount, setAmount] = useState('');
  const [banks, setBanks] = useState<any[]>([]);
  const [selectedBank, setSelectedBank] = useState<any>(null);
  const [showBankSelector, setShowBankSelector] = useState(false);

  React.useEffect(() => {
    async function fetchBanks() {
      const { data, error } = await supabase
        .from('bancos_arrecadacao_mcpn')
        .select('*');
      if (!error && data) setBanks(data);
    }
    fetchBanks();
  }, []);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '');
    setAmount(val);
  };

  const handleContinue = () => {
    const rechargeAmount = parseInt(amount);
    if (!amount || rechargeAmount < 9000) {
      showToast('O valor mínimo de recarga é 9.000 Kz.', 'error');
      return;
    }
    setShowBankSelector(true);
  };

  const handleSubmit = async () => {
    if (!selectedBank) {
      showToast('Por favor, selecione um banco para depósito.', 'error');
      return;
    }

    const rechargeAmount = parseInt(amount);
    setIsSubmitting(true);
    
    try {
      const { data, error } = await supabase.rpc('request_recharge_kz_mcpn', {
        p_amount: rechargeAmount
      });

      if (error) throw error;

      if (data.success) {
        // Passamos o ID do banco selecionado para a próxima página
        navigate(`/confirmar-recarga?id=${data.recharge_id}&amount=${rechargeAmount}&bankId=${selectedBank.id}`);
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
          <div className="space-y-8">
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
                    className={cn(
                      "p-3 border rounded-sm text-xs font-bold transition-all relative flex items-center justify-center",
                      amount === val.toString() 
                        ? "border-[#e81123] bg-red-50/30 text-[#e81123]" 
                        : "border-gray-200 text-gray-700 hover:bg-gray-50"
                    )}
                  >
                    {val.toLocaleString()}
                    {amount === val.toString() && (
                      <div className="absolute top-0 right-0 bg-[#e81123] text-white p-0.5 rounded-bl-sm">
                        <CheckCircle2 size={8} />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Selector de Bancos (Modal Estilo Microsoft) */}
            <AnimatePresence>
              {showBankSelector && (
                <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/40 backdrop-blur-sm">
                  <motion.div 
                    initial={{ opacity: 0, y: 100 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 100 }}
                    className="bg-white w-full max-w-lg rounded-t-xl sm:rounded-sm shadow-2xl overflow-hidden"
                  >
                    <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-[#fbfbfb]">
                      <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500">Selecionar Instituição</h3>
                      <button 
                        onClick={() => setShowBankSelector(false)} 
                        className="p-2 text-gray-400 hover:text-gray-600"
                        title="Fechar seletor"
                        aria-label="Fechar seletor de bancos"
                      >
                        <X size={20} />
                      </button>
                    </div>
                    
                    <div className="max-h-[60vh] overflow-y-auto p-2 custom-scrollbar">
                      {banks.map(bank => (
                        <div 
                          key={bank.id}
                          onClick={() => {
                            setSelectedBank(bank);
                            setShowBankSelector(false);
                          }}
                          className={cn(
                            "p-5 rounded-sm cursor-pointer transition-all flex items-center justify-between mb-1 group",
                            selectedBank?.id === bank.id 
                              ? "bg-blue-50/50 border border-ms-blue/20" 
                              : "hover:bg-gray-50 border border-transparent"
                          )}
                        >
                          <div className="flex items-center space-x-4">
                            <div className={cn(
                              "w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-xs shadow-sm",
                              selectedBank?.id === bank.id ? "bg-ms-blue" : "bg-gray-200"
                            )}>
                              {bank.nome_banco.charAt(0)}
                            </div>
                            <div>
                              <p className="text-[13px] font-bold text-gray-800 uppercase tracking-tight">{bank.nome_banco}</p>
                              <p className="text-[10px] text-gray-400 font-medium">Oficial Microsoft Node</p>
                            </div>
                          </div>
                          {selectedBank?.id === bank.id && (
                            <CheckCircle2 className="text-ms-blue w-5 h-5" />
                          )}
                        </div>
                      ))}
                    </div>

                    <div className="p-4 bg-gray-50 border-t border-gray-100">
                      <p className="text-[10px] text-center text-gray-400 font-bold uppercase tracking-widest">Escolha o banco para depósito</p>
                    </div>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>

            <div className="pt-4 space-y-4">
              {/* Campo que abre o seletor */}
              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest">Instituição de Depósito</label>
                <button 
                  type="button"
                  onClick={() => setShowBankSelector(true)}
                  className="w-full h-14 bg-[#fbfbfb] border border-[#e1e1e1] rounded-sm px-4 flex items-center justify-between text-left hover:border-ms-blue transition-colors group"
                >
                  <div className="flex items-center space-x-3">
                    <Landmark size={18} className={selectedBank ? "text-ms-blue" : "text-gray-300"} />
                    <span className={cn(
                      "text-sm font-medium",
                      selectedBank ? "text-gray-800" : "text-gray-400"
                    )}>
                      {selectedBank ? selectedBank.nome_banco : "Selecionar Instituição"}
                    </span>
                  </div>
                  <ChevronDown size={18} className="text-gray-300 group-hover:text-ms-blue" />
                </button>
              </div>

              <div className="pt-4">
                <Button 
                  onClick={handleSubmit} 
                  className="w-full h-14" 
                  isLoading={isSubmitting}
                  disabled={!selectedBank || !amount}
                >
                  Continuar para Pagamento
                </Button>
              </div>
              
              <div className="flex items-center justify-center space-x-2 text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                <ShieldCheck size={14} className="text-green-600" />
                <span>Transação Segura Microsoft</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
