import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ChevronLeft, Camera, ShieldCheck, Landmark, Info, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';
import { supabase } from '../lib/supabase';
import { useToast } from '../components/Toast';
import { Button } from '../components/Button';
import { cn } from '../lib/utils';

const BANKS = [
  'BAI - Banco Angolano de Investimentos',
  'BFA - Banco de Fomento Angola',
  'BIC - Banco Internacional de Crédito',
  'SOL - Banco Sol',
  'MIL - Banco Millennium Atlântico',
  'Multicaixa Express',
  'Transferência Direta'
];

export default function ConfirmRecharge() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [searchParams] = useSearchParams();
  const rechargeId = searchParams.get('id');
  const amount = searchParams.get('amount');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bankName, setBankName] = useState('');
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

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

    if (!bankName) {
      showToast('Selecione o banco de origem.', 'error');
      return;
    }
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
        p_bank_name: bankName,
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
        <h1 className="text-sm font-semibold ml-2 text-[#2b2b2b]">Confirmar Pagamento</h1>
      </header>

      <div className="p-6 max-w-lg mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-[#e1e1e1] shadow-sm p-8 rounded-sm text-left space-y-8"
        >
          <div className="text-center space-y-2">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">Valor a Confirmar</p>
            <h2 className="text-4xl font-light text-ms-blue tracking-tight">
              {Number(amount).toLocaleString()},00 <span className="text-sm font-bold">Kz</span>
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Banco de Origem</label>
              <div className="relative">
                <select 
                  className="input-field appearance-none cursor-pointer pr-10"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  title="Banco de Origem"
                  aria-label="Selecionar Banco"
                >
                  <option value="">Selecione de onde enviou</option>
                  {BANKS.map(b => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
                <Landmark className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none" size={16} />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Comprovativo (Imagem/PDF)</label>
              <input 
                type="file" 
                id="proofInput" 
                className="hidden" 
                accept="image/*,application/pdf"
                onChange={handleFileChange}
                title="Carregar comprovativo de pagamento"
                aria-label="Carregar comprovativo de pagamento"
              />
              <div 
                className={cn(
                  "border-2 border-dashed p-10 rounded-sm flex flex-col items-center justify-center space-y-3 cursor-pointer transition-all relative overflow-hidden min-h-[200px]",
                  previewUrl ? "border-green-500 bg-green-50" : "border-gray-200 hover:border-ms-blue hover:bg-gray-50"
                )}
                onClick={() => document.getElementById('proofInput')?.click()}
              >
                {previewUrl ? (
                  <>
                    <img src={previewUrl} alt="Preview" className="absolute inset-0 w-full h-full object-cover opacity-20" />
                    <CheckCircle2 className="text-green-500 w-10 h-10 relative z-10" />
                    <span className="text-xs font-bold text-green-700 relative z-10">Imagem Carregada</span>
                    <span className="text-[9px] text-gray-400 relative z-10">Toque para trocar</span>
                  </>
                ) : (
                  <>
                    <Camera className="text-ms-blue w-12 h-12" />
                    <div className="text-center">
                      <p className="text-xs font-bold text-gray-700">Carregar Foto ou PDF</p>
                      <p className="text-[10px] text-gray-400">Clique para selecionar o arquivo</p>
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="pt-4 space-y-4">
              <Button type="submit" className="w-full h-14" isLoading={isSubmitting}>
                Enviar Comprovativo
              </Button>
              <div className="flex items-center justify-center space-x-2 text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                <ShieldCheck size={14} className="text-green-600" />
                <span>Validado por Nó Seguro Microsoft</span>
              </div>
            </div>
          </form>
        </motion.div>

        <div className="mt-8 p-6 bg-blue-50 border border-blue-100 rounded-sm flex space-x-4 items-start">
          <Info className="text-ms-blue shrink-0 mt-0.5" size={18} />
          <div className="space-y-1">
            <p className="text-xs font-bold text-gray-900 uppercase tracking-tight">Dica de Verificação</p>
            <p className="text-[11px] text-gray-600 leading-relaxed">
              Certifique-se de que o **ID da Transação** e o **Valor** estejam bem visíveis na imagem para que a aprovação seja instantânea.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
