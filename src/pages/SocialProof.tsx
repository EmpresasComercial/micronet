import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Edit3, Camera, X, MessageCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useToast } from '../components/Toast';
import { Button } from '../components/Button';
import { supabase } from '../lib/supabase';
import { EmptyState } from '../components/EmptyState';

interface Proof {
  id: string;
  user: string;
  amount: string;
  comment: string;
  image: string;
  timestamp: string;
}

export default function SocialProof() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [proofs, setProofs] = useState<Proof[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  
  const [comment, setComment] = useState('');
  const [amount, setAmount] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function fetchProofs() {
      try {
        const { data, error } = await supabase.rpc('get_approved_social_proofs_mcpn');

        if (error) throw error;
        if (data) {
          const mapped: Proof[] = data.map((item: Record<string, any>) => ({
            id: item.id,
            user: `Usuário ***${item.user_id.substring(0, 4)}`,
            amount: `${Number(item.valor).toLocaleString()},00 Kz`,
            comment: item.comentario,
            image: item.imagem_url,
            timestamp: new Date(item.created_at).toLocaleString('pt-AO')
          }));
          setProofs(mapped);
        }
      } catch (err: any) {
        console.error('Erro ao buscar provas sociais:', err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchProofs();

    // Realtime Subscription
    const channel = supabase
      .channel('social_proofs_realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'social_proofs_mcpn',
          filter: 'status=eq.aprovado'
        },
        (payload) => {
          const newItem = payload.new;
          const mapped: Proof = {
            id: newItem.id,
            user: `Usuário ***${newItem.user_id.substring(0, 4)}`,
            amount: `${Number(newItem.valor).toLocaleString()},00 Kz`,
            comment: newItem.comentario,
            image: newItem.imagem_url,
            timestamp: new Date(newItem.created_at).toLocaleString('pt-AO')
          };
          setProofs(prev => [mapped, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '');
    setAmount(val);
  };

  const handleCommentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value.replace(/[<>]/g, '').slice(0, 200);
    setComment(val);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showToast('A imagem deve ter no máximo 5MB.', 'error');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => setImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !comment || !image) {
      showToast('Preencha todos os campos e anexe a foto.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const { data, error } = await supabase.rpc('submit_social_proof_mcpn', {
        p_valor: Number(amount),
        p_comentario: comment,
        p_imagem_url: image
      });

      if (error) throw error;

      showToast('Prova social enviada com sucesso para moderação!', 'success');
      setShowForm(false);
      setAmount('');
      setComment('');
      setImage(null);
    } catch (err: any) {
      showToast('Erro ao enviar comprovativo.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f2f2f2] pb-20">
      <header className="bg-white px-4 py-3 flex items-center justify-between border-b border-[#e1e1e1] sticky top-0 z-50">
        <div className="flex items-center">
          <button 
            onClick={() => navigate(-1)} 
            className="p-2 -ml-2 text-gray-600 hover:text-ms-blue transition-colors"
            aria-label="Voltar"
            title="Voltar"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="ml-4 text-sm font-semibold text-gray-900 uppercase tracking-widest">Prova Social</span>
        </div>
        <button 
          onClick={() => setShowForm(!showForm)}
          aria-label={showForm ? "Fechar formulário" : "Adicionar prova social"}
          title={showForm ? "Fechar" : "Adicionar"}
          className={`p-2 rounded-sm transition-colors ${showForm ? 'bg-ms-blue text-white' : 'text-gray-600 hover:bg-gray-100'}`}
        >
          {showForm ? <X className="w-5 h-5" /> : <Edit3 className="w-5 h-5" />}
        </button>
      </header>

      <main className="p-6 max-w-xl mx-auto">
        <AnimatePresence mode="wait">
          {showForm ? (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-8"
            >
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Compartilhe seu sucesso</h2>
                <p className="text-sm text-gray-500">Ajude outros usuários e ganhe bônus de visibilidade.</p>
              </div>

              <form onSubmit={handleSubmit} className="bg-white border border-[#e1e1e1] p-8 space-y-6">
                <div className="space-y-4">
                  <label className="block text-[11px] font-bold text-[#666] uppercase tracking-wider">Foto do Comprovativo</label>
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    ref={fileInputRef} 
                    onChange={handleImageChange}
                    aria-label="Fazer upload do comprovativo"
                    title="Upload"
                  />

                  {!image ? (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full py-12 border-2 border-dashed border-gray-200 rounded-sm flex flex-col items-center justify-center text-gray-400 hover:border-ms-blue transition-all"
                    >
                      <Camera className="w-10 h-10 mb-2" />
                      <span className="text-[10px] font-bold uppercase tracking-widest">Carregar Foto</span>
                    </button>
                  ) : (
                    <div className="relative border border-gray-200 rounded-sm overflow-hidden">
                      <img src={image} alt="Preview" className="w-full h-auto" />
                      <button 
                        type="button" 
                        onClick={() => setImage(null)} 
                        className="absolute top-2 right-2 bg-black/50 text-white p-1 rounded-full"
                        aria-label="Remover imagem"
                        title="Remover"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#666] uppercase tracking-wider mb-1">Valor Recebido (Kz)</label>
                  <input type="text" placeholder="Ex: 15000" className="input-field" value={amount} onChange={handleAmountChange} />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#666] uppercase tracking-wider mb-1">Seu Comentário</label>
                  <textarea placeholder="O que você achou da plataforma?" className="input-field min-h-[100px] py-3 resize-none" value={comment} onChange={handleCommentChange} />
                </div>

                <Button type="submit" isLoading={isSubmitting} className="w-full h-14">
                  Enviar Comprovativo
                </Button>
              </form>
            </motion.div>
          ) : (
            <div className="space-y-6">
               <div className="bg-blue-50 border-l-4 border-ms-blue p-4">
                  <p className="text-[10px] font-bold uppercase text-ms-blue tracking-widest mb-1">Mural da Transparência</p>
                  <p className="text-xs text-gray-600">Veja as provas de pagamentos reais dos nossos usuários Microsoft Cloud.</p>
               </div>
               
               {loading ? (
                  <div className="py-20 text-center text-gray-400 italic font-medium">Buscando comprovativos...</div>
               ) : proofs.length === 0 ? (
                  <EmptyState 
                    icon={<MessageCircle size={40} className="text-gray-100" />}
                    message="Nenhum comprovativo ainda"
                    description="Seja o primeiro a compartilhar seu sucesso e inspirar a comunidade!"
                  />
               ) : (
                  proofs.map(proof => (
                    <div key={proof.id} className="bg-white border border-[#e1e1e1] overflow-hidden">
                       <div className="p-4 flex items-center justify-between bg-gray-50/50">
                          <div className="flex items-center space-x-3">
                             <div className="w-8 h-8 bg-ms-blue text-white rounded-full flex items-center justify-center text-[10px] font-bold">MS</div>
                             <div>
                                <p className="text-xs font-bold text-gray-900">{proof.user}</p>
                                <p className="text-[9px] text-gray-400">{proof.timestamp}</p>
                             </div>
                          </div>
                          <div className="text-right">
                             <p className="text-xs font-bold text-green-600">+{proof.amount}</p>
                          </div>
                       </div>
                       <img src={proof.image} alt="Comprovativo" className="w-full h-auto grayscale-[0.3] hover:grayscale-0 transition-all" />
                       <div className="p-4 flex items-start space-x-2">
                          <MessageCircle size={14} className="text-ms-blue shrink-0 mt-0.5" />
                          <p className="text-xs text-gray-600 italic font-medium">"{proof.comment}"</p>
                       </div>
                    </div>
                  ))
               )}
            </div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
