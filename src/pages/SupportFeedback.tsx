import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, MessageSquare, Send, ShieldCheck } from 'lucide-react';
import { motion } from 'motion/react';
import { useToast } from '../components/Toast';
import { Button } from '../components/Button';
import { useLanguage } from '../contexts/LanguageContext';
import { supabase } from '../lib/supabase';

export default function SupportFeedback() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { t } = useLanguage();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState('');

  const handleFeedbackChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    // Sanitização: Impede scripts básicos e limita tamanho
    const val = e.target.value.replace(/[<>]/g, '').slice(0, 500);
    setFeedback(val);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (feedback.length < 10) {
      showToast('Por favor, descreva sua dúvida com mais detalhes.', 'error');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase.from('suporte_feedback').insert({
        user_id: user?.id,
        mensagem: feedback,
        status: 'pendente'
      });

      if (error) throw error;

      showToast('Sua mensagem foi enviada à equipe técnica!', 'success');
      setFeedback('');
      setTimeout(() => navigate('/suporte'), 1500);
    } catch (err: any) {
      showToast('Erro ao enviar feedback. Tente novamente mais tarde.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f2f2f2]">
      <header className="bg-white p-4 flex items-center border-b border-[#e1e1e1] sticky top-0 z-50">
        <button 
          onClick={() => navigate('/suporte')} 
          className="p-2 -ml-2 text-gray-600 hover:text-ms-blue transition-colors"
          aria-label="Voltar para o suporte"
          title="Voltar"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="text-sm font-semibold ml-2 text-[#2b2b2b]">Feedback Técnica</h1>
      </header>

      <div className="p-6 max-w-lg mx-auto">
        <div className="mb-10 text-left">
          <h2 className="text-3xl font-light text-[#2b2b2b] mb-3">Como podemos melhorar?</h2>
          <p className="text-sm text-[#616161]">Relate bugs, sugira melhorias ou peça ajuda técnica diretamente aos nossos desenvolvedores.</p>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-[#e1e1e1] p-8 rounded-sm shadow-sm"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Sua Mensagem</label>
              <textarea
                className="input-field min-h-[150px] py-4 resize-none"
                placeholder="Descreva seu problema ou sugestão aqui..."
                value={feedback}
                onChange={handleFeedbackChange}
              />
              <div className="flex justify-end mt-1">
                <span className="text-[10px] font-bold text-gray-400">{feedback.length} / 500</span>
              </div>
            </div>

            <div className="pt-4 space-y-4">
              <Button type="submit" className="w-full h-14" isLoading={isSubmitting}>
                Enviar Mensagem
              </Button>
              <div className="flex items-center justify-center space-x-2 text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                <ShieldCheck size={14} className="text-ms-blue" />
                <span>Ticket de Suporte Criptografado</span>
              </div>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
