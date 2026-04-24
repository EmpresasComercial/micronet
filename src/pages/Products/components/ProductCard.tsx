import React from 'react';
import { motion } from 'motion/react';
import { Button } from '../../../components/Button';
import { useLanguage } from '../../../contexts/LanguageContext';
import { Product } from '../../../constants/products';
import { formatCurrency } from '../../../lib/currency';

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
      className="ms-card p-6 flex flex-col h-full hover:shadow-lg hover:border-ms-blue/30 transition-all active:scale-[0.99]"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="bg-ms-bg w-20 h-20 shrink-0 overflow-hidden border border-black/5 flex items-center justify-center">
          {product.imagem_url ? (
            <img 
              src={product.imagem_url} 
              alt={t(`${product.key}.name`)} 
              className="w-full h-full object-contain mix-blend-multiply opacity-90"
              referrerPolicy="no-referrer"
            />
          ) : (
            product.icon
          )}
        </div>
        <div className="text-right">
          <span className="product-badge">{t('products.active_badge')}</span>
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
