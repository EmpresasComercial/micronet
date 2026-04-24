import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ChevronLeft, Camera, ShieldCheck, Landmark, Info, CheckCircle2, Copy, Check } from 'lucide-react';
import { motion } from 'motion/react';
import { supabase } from '../lib/supabase';
import { useToast } from '../components/Toast';
import { Button } from '../components/Button';
import { cn } from '../lib/utils';

export default function ConfirmarRecarga() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [searchParams] = useSearchParams();
  const rechargeId = searchParams.get('id');
  const amount = searchParams.get('amount');
  const bankId = searchParams.get('bankId');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bankDetails, setBankDetails] = useState<any>(null);
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  useEffect(() => {
    async function fetchBank() {
      if (!bankId) return;
      const { data, error } = await supabase
        .from('bancos_arrecadacao_mcpn')
        .select('*')
        .eq('id', bankId)
        .single();
      
      if (!error && data) {
        setBankDetails(data);
      }
    }
    fetchBank();
  }, [bankId]);

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
    showToast('Copiado para a área de transferência', 'success');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showToast('O comprovativo deve ter no máximo 5MB.', 'error');
        return;
      }
      setProofFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setPreviewUrl(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!proofFile) {
      showToast('Por favor, carregue o comprovativo do pagamento.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Não autenticado');

      // 1. Upload da Imagem
      const fileName = `${user.id}/${rechargeId}_${Date.now()}.jpg`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('recargas')
        .upload(fileName, proofFile, { upsert: true });

      if (uploadError) throw uploadError;

      // 2. Confirmar no Banco via RPC
      const { data, error: rpcError } = await supabase.rpc('confirm_recharge_mcpn', {
        p_recharge_id: rechargeId,
        p_bank_name: bankDetails?.nome_banco || 'Depósito Bancário',
        p_image_path: uploadData.path
      });

      if (rpcError) throw rpcError;

      if (data.success) {
        showToast('Comprovativo enviado! Sua recarga será validada em breve.', 'success');
        navigate('/registro-recarga');
      } else {
        showToast(data.message, 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Erro ao confirmar pagamento.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f2f2f2] pb-20">
      <header className="bg-white p-4 flex items-center border-b border-[#e1e1e1] sticky top-0 z-50">
        <button onClick={() => navigate('/recarregar')} className="p-2 -ml-2 text-gray-600" title="Voltar">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="text-sm font-semibold ml-2 text-[#2b2b2b]">Finalizar Depósito</h1>
      </header>

      <div className="p-6 max-w-lg mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-[#e1e1e1] shadow-sm p-8 rounded-sm text-left space-y-8"
        >
          {/* Valor e Dados Bancários */}
          <div className="space-y-6">
            <div className="text-center space-y-2 pb-6 border-b border-gray-100">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">Montante a Transferir</p>
              <div className="flex items-center justify-center space-x-2">
                <h2 className="text-4xl font-light text-ms-blue tracking-tight">
                  {Number(amount).toLocaleString()},00 <span className="text-sm font-bold">Kz</span>
                </h2>
                <button 
                  onClick={() => copyToClipboard(amount || '', 'amount')}
                  className="p-2 text-gray-400 hover:text-ms-blue transition-colors"
                >
                  {copiedField === 'amount' ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                </button>
              </div>
            </div>

            {bankDetails && (
              <div className="bg-[#fbfbfb] border border-gray-100 p-6 rounded-sm space-y-4">
                <div className="space-y-0.5">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Banco Destinatário</p>
                  <p className="text-sm font-bold text-gray-800 uppercase">{bankDetails.nome_banco}</p>
                </div>
                <div className="space-y-0.5">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Beneficiário</p>
                  <p className="text-sm font-bold text-gray-800 uppercase">{bankDetails.nome_proprietario}</p>
                </div>
                <div className="space-y-0.5 relative">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">IBAN para Depósito</p>
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-mono font-bold text-ms-blue select-all">{bankDetails.iban}</p>
                    <button 
                      onClick={() => copyToClipboard(bankDetails.iban, 'iban')}
                      className="p-1 text-gray-400 hover:text-ms-blue transition-colors"
                    >
                      {copiedField === 'iban' ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Carregar Comprovativo</label>
              <input 
                type="file" 
                id="proofInput" 
                className="hidden" 
                accept="image/*,application/pdf"
                onChange={handleFileChange}
                title="Selecionar comprovativo"
              />
              <div 
                className={cn(
                  "border-2 border-dashed p-10 rounded-sm flex flex-col items-center justify-center space-y-3 cursor-pointer transition-all relative overflow-hidden min-h-[180px]",
                  previewUrl ? "border-green-500 bg-green-50" : "border-gray-200 hover:border-ms-blue hover:bg-gray-50"
                )}
                onClick={() => document.getElementById('proofInput')?.click()}
              >
                {previewUrl ? (
                  <>
                    <img src={previewUrl} alt="Preview" className="absolute inset-0 w-full h-full object-cover opacity-20" />
                    <CheckCircle2 className="text-green-500 w-10 h-10 relative z-10" />
                    <span className="text-xs font-bold text-green-700 relative z-10">Comprovativo Pronto</span>
                  </>
                ) : (
                  <>
                    <Camera className="text-ms-blue w-12 h-12" />
                    <div className="text-center">
                      <p className="text-xs font-bold text-gray-700">Clique para anexar arquivo</p>
                      <p className="text-[9px] text-gray-400 uppercase font-bold tracking-tighter">Máximo 5MB</p>
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="pt-4 space-y-4">
              <Button type="submit" className="w-full h-14" isLoading={isSubmitting}>
                Confirmar Pagamento
              </Button>
              <div className="flex items-center justify-center space-x-2 text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                <ShieldCheck size={14} className="text-green-600" />
                <span>Segurança Certificada Microsoft</span>
              </div>
            </div>
          </form>
        </motion.div>

        <div className="mt-8 p-6 bg-blue-50 border border-blue-100 rounded-sm flex space-x-4 items-start">
          <Info className="text-ms-blue shrink-0 mt-0.5" size={18} />
          <div className="space-y-1">
            <p className="text-xs font-bold text-gray-900 uppercase tracking-tight">Instruções de Depósito</p>
            <p className="text-[11px] text-gray-600 leading-relaxed">
              Realize a transferência para os dados acima. Após concluir, anexe o comprovativo e clique em **Confirmar Pagamento** para processar seu saldo.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
