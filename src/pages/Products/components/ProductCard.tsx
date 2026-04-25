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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-white border border-gray-200 p-4 flex flex-col h-full transition-all active:scale-[0.99] rounded-sm"
    >
      <div className="-mx-4 -mt-4 mb-4 bg-white border-b border-gray-100 overflow-hidden">
        <div className="h-32 w-full flex items-center justify-center">
          {product.imagem_url ? (
            <SmartImage 
              src={product.imagem_url} 
              alt={t(`${product.key}.name`)} 
              className="w-full h-full mix-blend-multiply opacity-90"
            />
          ) : (
            <div className="transform scale-150">
              {product.icon}
            </div>
          )}
        </div>
      </div>

      <h3 className="text-xl font-semibold text-gray-900 leading-tight mb-2">
        {t(`${product.key}.name`)}
      </h3>
      <p className="text-sm text-gray-500 mb-6">{t(`${product.key}.version`)}</p>

      <div className="space-y-1 mb-6 flex-1 text-sm text-gray-600">
        <div className="flex justify-between items-center border-b border-black/5 pb-2">
          <span>{t('products.price')}:</span>
          <span className="font-bold text-gray-900">
            {formatCurrency(product.priceValue, 'KZ')}
          </span>
        </div>
        <div className="flex justify-between items-center border-b border-black/5 pb-2">
          <span>{t('products.daily')}:</span>
          <span className="font-bold text-green-600">
            {formatCurrency(product.priceValue * 0.05, 'KZ')} / {t('product.unit.day')}
          </span>
        </div>
        <div className="flex justify-between items-center border-b border-black/5 pb-2">
          <span>{t('products.duration')}:</span>
          <span className="text-gray-900">
            {product.durationDays} {product.durationDays === 1 ? t('product.unit.day') : t('product.unit.days')}
          </span>
        </div>
      </div>

      <Button 
        onClick={() => onBuy(product.id)}
        className="w-full"
      >
        {t('products.btn_buy')}
      </Button>
    </motion.div>
  );
};
