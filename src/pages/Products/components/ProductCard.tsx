import React from 'react';
import { motion } from 'motion/react';
import { Button } from '../../../components/Button';
import { useLanguage } from '../../../contexts/LanguageContext';
import { formatCurrency } from '../../../lib/currency';
import { SmartImage } from '../../../components/SmartImage';

export interface Product {
  id: string;
  key: string;
  priceValue: number;
  durationDays: number;
  size: string;
  icon: React.ReactNode;
  imagem_url?: string;
}

interface ProductCardProps {
  product: Product;
  index: number;
  onBuy: (id: string) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, index, onBuy }) => {
  const { t } = useLanguage();

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      onClick={() => onBuy(product.id)}
      className="bg-white border-y border-gray-100 p-4 flex items-center space-x-4 active:bg-gray-50 transition-all cursor-pointer"
    >
      {/* Product Image / Icon */}
      <div className="w-24 h-24 bg-gray-50 flex items-center justify-center p-2">
        {product.imagem_url ? (
          <SmartImage 
            src={product.imagem_url} 
            alt={t(`${product.key}.name`)} 
            className="w-full h-full object-contain"
          />
        ) : (
          <div className="text-ms-blue/50">
            {product.icon}
          </div>
        )}
      </div>

      {/* Product Details */}
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-[15px] font-bold text-gray-900 truncate">
              {t(`${product.key}.name`)}
            </h3>
            <p className="text-[11px] text-gray-400 font-bold tracking-tight mb-1">
              {t(`${product.key}.version`)}
            </p>
          </div>
        </div>

        <div className="mt-2 flex items-baseline space-x-2">
          <span className="text-lg font-black text-ms-blue">
            {formatCurrency(product.priceValue, 'KZ')}
          </span>
          <span className="text-[10px] text-gray-400 font-bold">
            / {product.durationDays}{t('product.unit.days').slice(0,1)}
          </span>
        </div>

        <div className="mt-1 text-[11px] font-bold flex items-center space-x-2">
          <span className="text-green-600 bg-green-50 px-1.5 py-0.5">
            +{formatCurrency(product.priceValue * 0.05, 'KZ')} {t('product.unit.day')}
          </span>
        </div>
      </div>

      {/* Direct Action Icon */}
      <div className="w-8 h-8 rounded-full bg-ms-blue/5 flex items-center justify-center">
        <div className="w-2 h-2 border-t-2 border-r-2 border-ms-blue rotate-45" />
      </div>
    </motion.div>
  );
};
