import React from 'react';
import { motion } from 'motion/react';
import { Users, Lock, Activity } from 'lucide-react';
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
      label: t('home.users'),
      value: formatCurrency(totalUsdt, 'USDT'),
      icon: Users,
      color: 'text-ms-blue',
    },
    {
      label: t('home.secure'),
      value: formatCurrency(totalRecarregado, 'KZ'),
      icon: Lock,
      color: 'text-green-500',
    },
    {
      label: t('home.servers'),
      value: formatCurrency(totalRetirado, 'KZ'),
      icon: Activity,
      color: 'text-orange-500',
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
          <stat.icon className={`w-5 h-5 mb-2 ${stat.color}`} />
          <span className="text-base font-bold text-gray-900 text-[11px] leading-tight">{stat.value}</span>
          <span className="text-[10px] text-gray-400 uppercase font-bold mt-1">{stat.label}</span>
        </motion.div>
      ))}
    </div>
  );
};
