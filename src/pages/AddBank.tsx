import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, User, CreditCard } from 'lucide-react';
import { motion } from 'motion/react';
import { useToast } from '../components/Toast';
import { Button } from '../components/Button';
import { supabase } from '../lib/supabase';
import { useLanguage } from '../contexts/LanguageContext';

const BANKS = [
  'BAI - Banco Angolano de Investimentos',
  'BFA - Banco de Fomento Angola',
  'BIC - Banco Internacional de Crédito',
  'SOL - Banco Sol',
  'MIL - Banco Millennium Atlântico',
  
];

export default function AddBank() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { t } = useLanguage();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    bankName: '',
    holderName: '',
    iban: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    let sanitized = value;

    if (name === 'iban') {
      sanitized = value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    } else if (name === 'holderName') {
      sanitized = value.replace(/[^a-zA-Z\s]/g, '').replace(/\s\s+/g, ' ');
    }

    setFormData(prev => ({ ...prev, [name]: sanitized }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.bankName) {
      showToast(t('common.error'), 'error'); // Generic error, could be better
      return;
    }
    if (formData.holderName.length < 5) {
      showToast(t('common.error'), 'error');
      return;
    }
    if (formData.iban.length < 21) {
      showToast(t('common.error'), 'error');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const { data, error } = await supabase.rpc('save_bank_data_mcpn', {
        p_bank_name: formData.bankName,
        p_holder_name: formData.holderName,
        p_iban: formData.iban
      });

      if (error) throw error;

      if (data.success) {
        showToast(t('common.success'), 'success');
        navigate('/perfil');
      } else {
        showToast(data.message, 'error');
      }
    } catch (err: any) {
      showToast(err.message || t('common.error'), 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f2f2f2]">
      <header className="bg-white p-4 flex items-center border-b border-[#e1e1e1] sticky top-0 z-50">
        <button 
          onClick={() => navigate('/perfil')} 
          className="p-2 -ml-2 text-[#616161]"
          aria-label={t('common.back')}
          title={t('common.back')}
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="text-sm font-semibold ml-2 text-[#2b2b2b]">{t('bank.title')}</h1>
      </header>

      <div className="p-6 max-w-lg mx-auto">
        <div className="mb-10 text-left">
          <h2 className="text-3xl font-light text-[#2b2b2b] mb-3">{t('bank.bind')}</h2>
          <p className="text-sm text-[#616161]">{t('bank.desc')}</p>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-[#e1e1e1] p-8 rounded-sm shadow-sm"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{t('bank.name')}</label>
                <select 
                  name="bankName"
                  className="input-field appearance-none cursor-pointer"
                  value={formData.bankName}
                  onChange={handleChange}
                  aria-label={t('bank.name')}
                  title={t('bank.name')}
                >
                  <option value="">{t('bank.select')}</option>
                  {BANKS.map(bank => (
                    <option key={bank} value={bank}>{bank}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{t('bank.holder')}</label>
                <div className="relative">
                  <input
                    name="holderName"
                    type="text"
                    className="input-field pr-10"
                    placeholder={t('bank.holder_placeholder')}
                    value={formData.holderName}
                    onChange={handleChange}
                  />
                  <User className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{t('bank.iban')}</label>
                <div className="relative">
                  <input
                    name="iban"
                    type="text"
                    className="input-field pr-10 font-mono"
                    placeholder="AO06..."
                    value={formData.iban}
                    onChange={handleChange}
                    maxLength={25}
                  />
                  <CreditCard className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
                </div>
              </div>
            </div>

            <div className="pt-4 space-y-4">
              <Button type="submit" className="w-full h-[45px]" isLoading={isSubmitting}>
                {t('bank.save_btn')}
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}

