import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Landmark, CheckCircle2, ChevronDown, AlertCircle, ReceiptText } from 'lucide-react';
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
  const selectRef = useRef<HTMLSelectElement>(null);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [amount, setAmount] = useState('');
  const [banks, setBanks] = useState<any[]>([]);
  const [selectedBankId, setSelectedBankId] = useState('');
  const [showBankField, setShowBankField] = useState(false);

  const MIN_RECHARGE = 9000;
  const isAmountValid = parseInt(amount || '0') >= MIN_RECHARGE;

  useEffect(() => {
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
    // Se o usuário mudar o valor para algo inválido, resetamos o banco e escondemos o campo
    if (parseInt(val || '0') < MIN_RECHARGE) {
      setShowBankField(false);
      setSelectedBankId('');
    }
  };

  const handleMainAction = async () => {
    // 1. Validar Valor
    if (!isAmountValid) {
      showToast(`O valor mínimo de recarga é ${MIN_RECHARGE.toLocaleString()} Kz.`, 'error');
      return;
    }

    // 2. Se o campo de banco ainda não apareceu, mostramos ele
    if (!showBankField) {
      setShowBankField(true);
      // Focamos no select após ele aparecer
      setTimeout(() => {
        selectRef.current?.focus();
      }, 300);
      return;
    }

    // 3. Validar se o banco foi selecionado
    if (!selectedBankId) {
      showToast('Por favor, selecione uma instituição para depósito.', 'error');
      selectRef.current?.focus();
      return;
    }

    // 4. Se tudo estiver ok, prosseguimos
    setIsSubmitting(true);
    try {
      const { data, error } = await supabase.rpc('request_recharge_kz_mcpn', {
        p_amount: parseInt(amount)
      });

      if (error) throw error;

      if (data.success) {
        navigate(`/confirmar-recarga?id=${data.recharge_id}&amount=${amount}&bankId=${selectedBankId}`);
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
        <button 
          onClick={() => navigate('/registro-recarga')}
          className="ml-auto p-2 text-gray-400 hover:text-ms-blue transition-colors"
          title="Histórico de Recargas"
        >
          <ReceiptText className="w-6 h-6" strokeWidth={1.5} />
        </button>
      </header>

      <div className="p-6 max-w-lg mx-auto">
        <div className="mb-10 text-left">
          <h2 className="text-3xl font-light text-[#2b2b2b] mb-3">Adicionar Saldo</h2>
          <p className="text-sm text-[#616161]">Insira o montante desejado para iniciar o processo.</p>
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
                  className={cn(
                    "input-field text-2xl font-light h-16 transition-all",
                    amount && !isAmountValid ? "border-b-red-500 bg-red-50/5" : ""
                  )}
                  placeholder="0.00"
                  value={amount}
                  onChange={handleAmountChange}
                />
                <Landmark className={cn(
                  "absolute right-4 top-1/2 -translate-y-1/2 transition-colors",
                  isAmountValid ? "text-ms-blue" : "text-gray-200"
                )} size={24} />
              </div>
              
              {amount && !isAmountValid && (
                <motion.p 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-[10px] text-red-500 font-bold uppercase mt-2 flex items-center"
                >
                  <AlertCircle size={12} className="mr-1" /> Mínimo: {MIN_RECHARGE.toLocaleString()} Kz
                </motion.p>
              )}

              <div className="grid grid-cols-3 gap-2 mt-4">
                {[10000, 50000, 100000].map(val => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => {
                      setAmount(val.toString());
                      // Se o valor sugerido for válido, não precisamos esconder nada, 
                      // mas a lógica de ativação do banco será tratada no handleMainAction
                    }}
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

            <AnimatePresence>
              {showBankField && (
                <motion.div 
                  initial={{ opacity: 0, height: 0, y: -20 }}
                  animate={{ opacity: 1, height: 'auto', y: 0 }}
                  exit={{ opacity: 0, height: 0, y: -20 }}
                  className="space-y-1 overflow-hidden"
                >
                  <label className="block text-[10px] font-bold text-ms-blue uppercase tracking-widest mb-1">Escolha a Instituição de Depósito</label>
                  <div className="relative">
                    <select 
                      ref={selectRef}
                      className="input-field py-2 pr-10 appearance-none bg-white font-medium cursor-pointer border-ms-blue/30"
                      value={selectedBankId}
                      onChange={(e) => setSelectedBankId(e.target.value)}
                      aria-label="Selecionar Instituição"
                      title="Banco"
                    >
                      <option value="">Selecionar Instituição</option>
                      {banks.map((bank) => (
                        <option key={bank.id} value={bank.id}>
                          {bank.nome_banco}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-ms-blue pointer-events-none" size={18} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="pt-4 space-y-4">
              <Button 
                onClick={handleMainAction} 
                className="w-full h-14" 
                isLoading={isSubmitting}
              >
                {selectedBankId ? "Avançar" : "Continuar para pagamento"}
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
