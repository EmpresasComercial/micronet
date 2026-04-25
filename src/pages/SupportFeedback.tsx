import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ShieldCheck } from 'lucide-react';
import { motion } from 'motion/react';
import { useToast } from '../components/Toast';
import { Button } from '../components/Button';
import { supabase } from '../lib/supabase';
import { useLanguage } from '../contexts/LanguageContext';

export default function SupportFeedback() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { t } = useLanguage();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState('');

  const handleFeedbackChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value.replace(/[<>]/g, '').slice(0, 500);
    setFeedback(val);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (feedback.length < 10) {
      showToast(t('common.error'), 'error');
      return;
    }

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      showToast(t('common.error'), 'error');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const { error } = await supabase
        .from('feedback_suporte_mcpn')
        .insert({
          user_id: session.user.id,
          mensagem: feedback
        });

      if (error) throw error;

      showToast(t('common.success'), 'success');
      setFeedback('');
      setTimeout(() => navigate('/suporte'), 1500);
    } catch (err: any) {
      console.error('Feedback Error:', err);
      showToast(t('common.error'), 'error');
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
          aria-label={t('common.back')}
          title={t('common.back')}
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="text-sm font-semibold ml-2 text-[#2b2b2b]">{t('support.feedback_title')}</h1>
      </header>

      <div className="p-6 max-w-lg mx-auto">
        <div className="mb-10 text-left">
          <h2 className="text-3xl font-light text-[#2b2b2b] mb-3">{t('support.feedback_question')}</h2>
          <p className="text-sm text-[#616161]">{t('support.feedback_desc')}</p>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-[#e1e1e1] p-8 rounded-sm shadow-sm"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{t('support.your_msg')}</label>
              <textarea
                className="input-field min-h-[150px] py-4 resize-none"
                placeholder={t('support.msg_placeholder')}
                value={feedback}
                onChange={handleFeedbackChange}
              />
              <div className="flex justify-end mt-1">
                <span className="text-[10px] font-bold text-gray-400">{feedback.length} / 500</span>
              </div>
            </div>

            <div className="pt-4 space-y-4">
              <Button type="submit" className="w-full h-14" isLoading={isSubmitting}>
                {t('support.send_msg')}
              </Button>
              <div className="flex items-center justify-center space-x-2 text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                <ShieldCheck size={14} className="text-ms-blue" />
                <span>{t('support.encrypted_ticket')}</span>
              </div>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
