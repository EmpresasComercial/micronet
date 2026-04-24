import React from 'react';
import { ChevronDown } from 'lucide-react';
import { Button } from '../../../components/Button';
import { useLanguage } from '../../../contexts/LanguageContext';
import { formatCurrency, CurrencyType } from '../../../lib/currency';

interface BalanceCardProps {
  balance: number;
  recharge: number;
  profit: number;
  withdrawn: number;
  currency: CurrencyType;
  setCurrency: (c: CurrencyType) => void;
  onRecharge: () => void;
  onWithdraw: () => void;
}

export const BalanceCard: React.FC<BalanceCardProps> = ({
  balance,
  recharge,
  profit,
  withdrawn,
  teamCommission,
  currency,
  setCurrency,
  onRecharge,
  onWithdraw
}) => {
  const { t } = useLanguage();

  const currencyOptions = [
    { id: 'KZ', name: 'Kwanza (AOA)' },
    { id: 'USDT', name: 'Tether (USDT)' },
  ];

  return (
    <div className="ms-card p-10 flex flex-col relative">
      <div className="space-y-4">
        <div className="flex flex-col">
          <span className="text-xs text-gray-500 uppercase font-bold tracking-wider">{t('profile.balance')}</span>
          <div className="flex items-center space-x-2">
            <span className="text-3xl font-light">{formatCurrency(balance, currency)}</span>
            <div className="relative p-1 hover:bg-gray-100 rounded-sm transition-colors text-gray-400 hover:text-ms-blue">
              <ChevronDown size={18} />
              <select 
                value={currency}
                onChange={(e) => setCurrency(e.target.value as CurrencyType)}
                title={t('profile.moeda_local')}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              >
                {currencyOptions.map(opt => (
                  <option key={opt.id} value={opt.id}>{opt.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-y-6 gap-x-4 pt-4 border-t border-black/5">
          <div className="flex flex-col text-sm">
            <span className="text-[10px] text-gray-400 uppercase font-bold tracking-tight mb-0.5">{t('profile.recharge')}</span>
            <span className="font-bold text-[#323130]">{formatCurrency(recharge, currency)}</span>
          </div>
          <div className="flex flex-col text-sm">
            <span className="text-[10px] text-gray-400 uppercase font-bold tracking-tight mb-0.5">Lucro Acumulado</span>
            <span className="font-bold text-ms-blue">{formatCurrency(profit, currency)}</span>
          </div>
          <div className="flex flex-col text-sm">
            <span className="text-[10px] text-gray-400 uppercase font-bold tracking-tight mb-0.5">{t('profile.total_withdrawn')}</span>
            <span className="font-bold text-green-600">{formatCurrency(withdrawn, currency)}</span>
          </div>
          <div className="flex flex-col text-sm">
            <span className="text-[10px] text-gray-400 uppercase font-bold tracking-tight mb-0.5">Comissões de Equipe</span>
            <span className="font-bold text-[#e81123]">{formatCurrency(teamCommission, currency)}</span>
          </div>
        </div>
        
        <div className="pt-8 grid grid-cols-2 gap-3">
          <Button onClick={onRecharge} className="text-sm">
            {t('profile.recharge')}
          </Button>
          <Button 
            variant="outline"
            onClick={onWithdraw}
            className="text-gray-700 py-2 text-sm font-semibold border-gray-400"
          >
            {t('profile.withdraw')}
          </Button>
        </div>
      </div>
    </div>
  );
};
