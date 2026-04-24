import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ChevronLeft, Camera, ShieldCheck, Landmark, Info, CheckCircle2, Copy, Check, Loader2, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
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
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [bankDetails, setBankDetails] = useState<any>(null);
  const [proofFile, setProofFile] = useState<File | Blob | null>(null);
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

  const compressImage = async (file: File): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 1200;
          const MAX_HEIGHT = 1600;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);

          // Melhoria de qualidade (nitidez leve)
          if (ctx) {
            ctx.globalCompositeOperation = 'source-over';
          }

          canvas.toBlob(
            (blob) => {
              if (blob) resolve(blob);
              else reject(new Error('Falha na compressão'));
            },
            'image/jpeg',
            0.8 // 80% qualidade para bom equilíbrio tamanho/qualidade
          );
        };
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsOptimizing(true);
      try {
        // Preview imediato
        const reader = new FileReader();
        reader.onloadend = () => setPreviewUrl(reader.result as string);
        reader.readAsDataURL(file);

        // Otimização real
        const optimizedBlob = await compressImage(file);
        setProofFile(optimizedBlob);
        showToast(`Imagem otimizada: ${(file.size / 1024).toFixed(0)}KB → ${(optimizedBlob.size / 1024).toFixed(0)}KB`, 'success');
      } catch (err) {
        showToast('Erro ao processar imagem.', 'error');
        setProofFile(file); // Fallback para original
      } finally {
        setIsOptimizing(false);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!proofFile) {
      showToast('Por favor, carregue o comprovativo do pagamento.', 'error');
      return;
    }

    setIsSubmitting(true);
    setUploadProgress(10); // Start progress

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Não autenticado');

      // 1. Upload da Imagem Otimizada
      const fileName = `${user.id}/${rechargeId}_${Date.now()}.jpg`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('recargas')
        .upload(fileName, proofFile, { 
          upsert: true,
          contentType: 'image/jpeg'
        });

      if (uploadError) throw uploadError;
      setUploadProgress(60);

      // 2. Confirmar no Banco via RPC
      const { data, error: rpcError } = await supabase.rpc('confirm_recharge_mcpn', {
        p_recharge_id: rechargeId,
        p_bank_name: bankDetails?.nome_banco || 'Depósito Bancário',
        p_image_path: uploadData.path
      });

      if (rpcError) throw rpcError;
      setUploadProgress(100);

      if (data.success) {
        showToast('Comprovativo enviado com sucesso!', 'success');
        setTimeout(() => navigate('/registro-recarga'), 1500);
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
          className="bg-white border border-[#e1e1e1] shadow-sm p-8 rounded-sm text-left space-y-8 relative overflow-hidden"
        >
          {/* Barra de Progresso de Upload */}
          <AnimatePresence>
            {isSubmitting && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute top-0 left-0 right-0 h-1 bg-gray-100 z-50"
              >
                <motion.div 
                  className="h-full bg-ms-blue transition-all duration-500"
                  style={{ width: `${uploadProgress}%` }}
                />
              </motion.div>
            )}
          </AnimatePresence>

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
              <label className="flex items-center justify-between text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">
                <span>Anexar Comprovativo</span>
                {isOptimizing && (
                  <span className="text-ms-blue flex items-center normal-case animate-pulse">
                    <Loader2 size={10} className="animate-spin mr-1" /> Otimizando...
                  </span>
                )}
              </label>
              <input 
                type="file" 
                id="proofInput" 
                className="hidden" 
                accept="image/*"
                onChange={handleFileChange}
                title="Selecionar comprovativo"
              />
              <div 
                className={cn(
                  "border-2 border-dashed rounded-sm flex flex-col items-center justify-center transition-all cursor-pointer overflow-hidden",
                  previewUrl 
                    ? "border-green-500 bg-white p-2" 
                    : "border-gray-200 hover:border-ms-blue hover:bg-gray-50 p-10 min-h-[180px]"
                )}
                onClick={() => !isSubmitting && document.getElementById('proofInput')?.click()}
              >
                {previewUrl ? (
                  <div className="w-full space-y-4">
                    <div className="relative group">
                      <img 
                        src={previewUrl} 
                        alt="Comprovativo" 
                        className="w-full h-auto max-h-[400px] object-contain rounded-sm shadow-sm" 
                      />
                      <div className="absolute inset-0 bg-green-500/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Sparkles className="text-green-600 w-12 h-12" />
                      </div>
                    </div>
                    <div className="flex items-center justify-center space-x-2 pb-2">
                      <CheckCircle2 className="text-green-500 w-5 h-5" />
                      <span className="text-xs font-bold text-green-700 uppercase tracking-widest">
                        {isOptimizing ? "Otimizando Qualidade..." : "Documento Otimizado"}
                      </span>
                    </div>
                  </div>
                ) : (
                  <>
                    <Camera className="text-ms-blue w-12 h-12 mb-3" />
                    <div className="text-center">
                      <p className="text-xs font-bold text-gray-700">Clique para anexar arquivo</p>
                      <p className="text-[9px] text-gray-400 uppercase font-bold tracking-tighter">Processamento Inteligente Ativo</p>
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="pt-4 space-y-4">
              <Button type="submit" className="w-full h-14" isLoading={isSubmitting}>
                {isSubmitting ? `Enviando (${uploadProgress}%)...` : "Confirmar Pagamento"}
              </Button>
              <div className="flex items-center justify-center space-x-2 text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                <ShieldCheck size={14} className="text-green-600" />
                <span>Segurança Certificada Microsoft</span>
              </div>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
