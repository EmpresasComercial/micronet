import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ShieldCheck } from 'lucide-react';
import { motion } from 'motion/react';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { supabase } from '../lib/supabase';
import { useToast } from '../components/Toast';
import { useLanguage } from '../contexts/LanguageContext';

export default function BankInfo() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { t } = useLanguage();

  const [linkedBanks, setLinkedBanks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialog, setDeleteDialog] = useState<{ isOpen: boolean; id: string | null }>({
    isOpen: false,
    id: null
  });

  useEffect(() => {
    async function fetchBanks() {
      try {
        const { data, error } = await supabase.rpc('get_my_bank_accounts_mcpn');
        if (error) throw error;
        if (data) setLinkedBanks(data);
      } catch (err) {
        console.error('Erro ao buscar bancos:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchBanks();
  }, []);

  const maskIban = (iban: string) => {
    if (!iban || iban.length < 21) return iban;
    const start = iban.slice(0, 4);
    const end = iban.slice(-4);
    return `${start} • • • • ${end}`;
  };

  const handleDelete = async (id: string) => {
    try {
      const { data, error } = await supabase.rpc('remove_bank_account_mcpn', {
        p_id: id
      });
      
      if (error) throw error;
      if (!data.success) throw new Error(data.message);
      
      setLinkedBanks(prev => prev.filter(b => b.id !== id));
      showToast('Conta excluída com sucesso!', 'success');
    } catch (err: any) {
      showToast('Erro ao excluir: ' + err.message, 'error');
    }
  };

  return (
    <div className="min-h-screen bg-ms-bg pb-20">
      <ConfirmDialog 
        isOpen={deleteDialog.isOpen}
        onClose={() => setDeleteDialog({ isOpen: false, id: null })}
        onConfirm={() => deleteDialog.id && handleDelete(deleteDialog.id)}
        title={t('bank.remove')}
        message="Tem certeza que deseja excluir esta conta bancária? Esta ação não pode ser desfeita."
        confirmText={t('common.confirm')}
        cancelText={t('common.cancel')}
        variant="danger"
      />
      <header className="bg-white p-4 flex items-center border-b border-[#e1e1e1]">
        <button 
          onClick={() => navigate('/perfil')} 
          className="p-2 -ml-2 text-[#616161] hover:text-[#2b2b2b]"
          title={t('common.back')}
          aria-label={t('common.back')}
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="text-sm font-semibold ml-2 text-[#2b2b2b]">Microsoft Exchange</h1>
      </header>

      <div className="p-6 max-w-lg mx-auto">
        <div className="mb-10">
          <h2 className="text-3xl font-light text-[#2b2b2b] mb-3">{t('bank.info_title')}</h2>
          <p className="text-sm text-[#616161]">{t('bank.info_desc')}</p>
        </div>
        
        <div className="space-y-6">
          {linkedBanks.map((bank) => (
            <motion.div
              key={bank.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white border border-[#e1e1e1] shadow-[0_2px_4px_rgba(0,0,0,0.05)] rounded-sm"
            >
              <div className="p-6">
                <div className="space-y-5">
                  <div className="flex justify-between items-start border-b border-[#f3f3f3] pb-4">
                    <div>
                      <h3 className="text-base font-semibold text-[#2b2b2b]">{bank.bank_name}</h3>
                      <p className="text-sm text-gray-500 font-mono tracking-tight">{maskIban(bank.iban)}</p>
                    </div>
                    <div className="flex items-center text-[#107c10] text-[11px] font-bold uppercase tracking-wider bg-[#dff6dd] px-2 py-1 rounded-sm">
                      <ShieldCheck size={12} className="mr-1" /> {t('bank.verified')}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">{t('bank.holder')}</div>
                      <p className="text-[#2b2b2b] text-sm font-medium">{bank.owner_name}</p>
                    </div>
                  </div>

                  <div className="pt-4 flex flex-col space-y-3">
                    <button 
                      onClick={() => {
                        setDeleteDialog({ isOpen: true, id: bank.id });
                      }}
                      className="text-sm text-[#a4262c] font-semibold hover:underline flex items-center justify-start"
                      aria-label={t('bank.remove')}
                    >
                      {t('bank.remove')}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}

          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            onClick={() => navigate('/adicionar-banco')}
            className="w-full py-3 border border-[#0067b8] text-[#0067b8] font-semibold hover:bg-[#0067b8]/5 transition-colors text-sm rounded-sm"
          >
            {t('bank.add_new')}
          </motion.button>

          <div className="mt-16 pt-10 border-t border-[#e1e1e1] space-y-6">
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-[#2b2b2b]">{t('bank.security')}</h4>
              <p className="text-xs text-[#616161] leading-relaxed">
                {t('bank.security_desc')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
