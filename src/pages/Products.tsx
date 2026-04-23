import React from 'react';
import { ReceiptText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { products } from '../constants/products';
import { useLanguage } from '../contexts/LanguageContext';
import { ProductCard } from './Products/components/ProductCard';

export default function Products() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <header className="mb-8 mt-4">
        <img 
          src="https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg" 
          alt="MS" 
          className="h-5 mb-4"
          referrerPolicy="no-referrer"
        />
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-[#1b1b1b]">{t('products.title')}</h1>
          <button 
            onClick={() => navigate('/minhas-compras')}
            title={t('profile.history')}
            className="p-2 text-gray-400 hover:text-ms-blue transition-colors flex items-center space-x-1"
          >
            <ReceiptText className="w-6 h-6" strokeWidth={1.5} />
          </button>
        </div>
        <p className="text-gray-500 text-sm">{t('products.sub')}</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-8">
        {products.map((product, idx) => (
          <ProductCard 
            key={product.id}
            product={product}
            index={idx}
            onBuy={(id) => navigate(`/produtos/${id}`)}
          />
        ))}
      </div>
    </div>
  );
}

