import React from 'react';
import { motion } from 'motion/react';
import { useLanguage } from '../../../contexts/LanguageContext';
import { formatCurrency } from '../../../lib/currency';

interface StatsGridProps {
  totalUsdt: number;
  totalRecarregado: number;
  totalRetirado: number;
}

export const StatsGrid: React.FC<StatsGridProps> = ({ totalUsdt, totalRecarregado, totalRetirado }) => {
  const { t } = useLanguage();

  const stats = [
    {
      label: 'SALDO USDT',
      value: formatCurrency(totalUsdt, 'USDT'),
      img: '/investment.png',
    },
    {
      label: 'RECARREGADO',
      value: formatCurrency(totalRecarregado, 'KZ'),
      img: '/recharge.png',
    },
    {
      label: 'RETIRADA',
      value: formatCurrency(totalRetirado, 'KZ'),
      img: '/withdraw.png',
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-2 px-4 -mt-10 mb-8 relative z-20">
      {stats.map((stat, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 + i * 0.1 }}
          className="ms-card pt-6 pb-4 px-2 flex flex-col items-center text-center"
        >
          <img src={stat.img} alt={stat.label} className="w-5 h-5 mb-2 object-contain" />
          <span className="text-base font-bold text-gray-900 text-[11px] leading-tight">{stat.value}</span>
          <span className="text-[10px] text-gray-400 uppercase font-bold mt-1">{stat.label}</span>
        </motion.div>
      ))}
    </div>
  );
};
