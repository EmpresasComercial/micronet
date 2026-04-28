import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Info, ReceiptText, Copy, Scan, ShieldCheck, Coins, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { useToast } from '../components/Toast';
import { Button } from '../components/Button';
import { supabase } from '../lib/supabase';

export default function RechargeUSDT() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [amount, setAmount] = useState('');
  const [step, setStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [usdtConfig, setUsdtConfig] = useState({ address: '', rate: 1000 });

  useEffect(() => {
    async function fetchConfig() {
      const { data, error } = await supabase
        .from('usdt_config_mcpn')
        .select('endereco_carteira, taxa_cambio')
        .eq('ativo', true)
        .limit(1)
        .maybeSingle();
      
      if (data) {
        setUsdtConfig({
          address: data.endereco_carteira,
          rate: Number(data.taxa_cambio)
        });
      }
    }
    fetchConfig();
  }, []);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    showToast('Endereço copiado para a área de transferência!', 'info');
  };

  const handleNext = async () => {
    if (!amount) {
      showToast('Por favor, introduza o valor da recarga.', 'error');
      return;
    }
    
    const val = parseFloat(amount);
    if (val < 10) {
      showToast('O valor mínimo de recarga é de 10 USDT.', 'error');
      return;
    }

    setIsProcessing(true);
    try {
      const { data, error } = await supabase.rpc('request_recharge_usdt_mcpn', {
        p_amount_usdt: val
      });

      if (error) throw error;

      if (data.success) {
        setStep(2);
      } else {
        showToast(data.message, 'error');
      }
    } catch (error: any) {
      showToast(error.message || 'Erro ao processar pedido', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFinish = () => {
    showToast('Solicitação de recarga enviada! Aguarde a confirmação na rede (1-5 minutos).', 'success');
    navigate('/perfil');
  };
   
  const StepIndicator = () => (
    <div className="flex items-center justify-center space-x-4 mb-8">
      {[1, 2].map((num) => (
        <div key={num} className="flex items-center">
          <div 
            className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors border-2",
              step === num ? "bg-ms-blue text-white border-ms-blue" : 
              step > num ? "bg-green-500 text-white border-green-500" : "bg-white text-gray-400 border-gray-200"
            )}
          >
            {step > num ? <Check className="w-4 h-4" /> : num}
          </div>
          {num < 2 && (
            <div className={cn("w-12 h-[2px] ml-4", step > num ? "bg-green-500" : "bg-gray-200")} />
          )}
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-ms-bg pb-20">
      <header className="bg-white p-4 flex items-center border-b border-[#d2d2d2] sticky top-0 z-50">
        <button 
          onClick={() => navigate('/perfil')} 
          className="p-2 -ml-2 text-gray-600 hover:text-ms-blue transition-colors"
          aria-label="Voltar"
          title="Voltar"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-semibold ml-2 text-gray-900">Recargar USDT</h1>
        <button 
          onClick={() => navigate('/registro-recarga-usdt')}
          className="ml-auto p-2 text-gray-400 hover:text-ms-blue transition-colors"
          aria-label="Ver histórico de recargas"
          title="Histórico"
        >
          <ReceiptText className="w-6 h-6" strokeWidth={1.5} />
        </button>
      </header>

      <div className="p-6 max-w-lg mx-auto">
        <StepIndicator />

        <AnimatePresence mode="wait">
          {step === 1 ? (
            <motion.div 
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="ms-card p-10">
                <div className="flex items-center space-x-3 mb-8">
                  <Coins className="w-10 h-10 text-ms-blue opacity-20" />
                  <img 
                    src="https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg" 
                    alt="Microsoft" 
                    className="h-5"
                    referrerPolicy="no-referrer"
                  />
                </div>

                <div className="space-y-8">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1 italic">
                      Valor da Recarga
                    </label>
                    <div className="relative">
                      <input 
                        type="number" 
                        placeholder="Introduza o valor em USDT"
                        className="input-field pr-16"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                      />
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-ms-blue uppercase">USDT</div>
                    </div>
                    <p className="mt-2 text-[10px] text-gray-400 flex items-center font-medium">
                      <Info size={12} className="mr-1" /> Mínimo: 10 USDT | Máximo: 1.000.000 USDT
                    </p>
                  </div>

                  <div className="bg-[#f3f2f1] border border-[#e1e1e1] p-5 rounded-sm">
                    <p className="text-[11px] text-[#323130] leading-relaxed font-medium">
                      <span className="text-[#0067b8] font-bold">Câmbio Atual:</span> 1 USDT = 1.100 Kz
                      <br />
                      <span className="text-[#0067b8] font-bold">Total em Kz:</span> {(parseFloat(amount || '0') * 1100).toLocaleString('pt-BR')},00 Kz
                    </p>
                  </div>

                  <div className="pt-2">
                    <Button 
                      onClick={handleNext}
                      className="w-full h-[45px]"
                      isLoading={isProcessing}
                    >
                      Próximo Passo
                    </Button>
                  </div>
                </div>
              </div>

              <div className="text-center opacity-30 py-4">
                <img 
                  src="https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg" 
                  className="h-3 mx-auto grayscale mb-2" 
                  alt="MS"
                  referrerPolicy="no-referrer"
                />
                <p className="text-[9px] font-bold uppercase tracking-widest">Official Cloud Tether Node</p>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6 pb-10"
            >
              <div className="ms-card p-8 flex flex-col items-center">
                <div className="flex flex-col items-center mb-6">
                  <h2 className="text-sm font-bold text-gray-900 uppercase tracking-widest italic">Pagar com USDT</h2>
                  <div className="mt-1 bg-ms-blue text-white text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                    Rede USDT TRC20 Apenas
                  </div>
                </div>
                
                <div className="bg-white p-4 border border-[#e1e1e1] rounded-sm shadow-sm mb-6">
                  <img 
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${usdtConfig.address}`}
                    alt="USDT QR Code"
                    className="w-[200px] h-[200px]"
                  />
                </div>

                <div className="w-full space-y-4">
                  <div className="text-center bg-blue-50 py-3 px-4 rounded-sm border border-blue-100">
                    <p className="text-[10px] text-ms-blue font-bold uppercase tracking-widest mb-0.5">Total a Transferir</p>
                    <p className="text-2xl font-bold text-ms-blue">{amount} USDT</p>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block">Endereço de Destino (TRC20)</label>
                    <div className="flex items-center bg-[#f2f2f2] border border-[#e1e1e1] p-3 rounded-sm">
                        <span className="text-[11px] font-mono font-bold text-gray-600 truncate flex-1 mr-2">{usdtConfig.address}</span>
                        <button 
                          onClick={() => copyToClipboard(usdtConfig.address)} 
                          className="p-2 text-ms-blue hover:bg-white rounded-sm transition-all shadow-sm"
                          aria-label="Copiar endereço da carteira"
                          title="Copiar"
                        >
                          <Copy size={16} />
                        </button>
                    </div>
                  </div>

                  <div className="p-3 border-l-2 border-ms-blue bg-white text-[11px] text-gray-600 space-y-2">
                    <div className="flex items-center space-x-2 text-ms-blue font-bold">
                      <ShieldCheck size={14} />
                      <span className="uppercase tracking-widest text-[9px]">Segurança Microsoft</span>
                    </div>
                    <p>Envie apenas USDT pela rede **TRC20**. O envio por outras redes (ERC20, BEP20) resultará na perda permanente dos fundos.</p>
                  </div>

                  <div className="pt-4 space-y-3">
                    <Button 
                      onClick={handleFinish}
                      className="w-full h-[45px]"
                      isLoading={isProcessing}
                    >
                      Confirmar Pagamento
                    </Button>
                    <button 
                      onClick={() => setStep(1)}
                      className="w-full text-[10px] font-bold text-gray-400 uppercase tracking-widest hover:text-gray-600 py-2"
                    >
                      Voltar e alterar valor
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="text-center py-6">
                <Scan className="w-10 h-10 text-gray-100 mx-auto mb-2" />
                <p className="text-[9px] text-gray-300 font-bold uppercase tracking-[0.3em]">Scaneie para autenticar a transação</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
