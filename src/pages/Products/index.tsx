import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import { ProductCard } from './components/ProductCard';
import { supabase } from '../../lib/supabase';
import { ReceiptText, Monitor, ShieldCheck, Zap, Terminal } from 'lucide-react';

const ICON_MAP: Record<string, React.ReactNode> = {
  'product.win7': <Monitor className="w-10 h-10 text-blue-500" />,
  'product.win8': <ShieldCheck className="w-10 h-10 text-blue-600" />,
  'product.win10': <Zap className="w-10 h-10 text-blue-700" />,
  'product.win11': <Monitor className="w-10 h-10 text-blue-800" />,
  'product.mas': <Terminal className="w-10 h-10 text-gray-700" />,
};

export default function Products() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [products, setProducts] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchProducts() {
      try {
        const { data, error } = await supabase.rpc('get_available_products_mcpn');
        if (error) throw error;
        
        const mappedProducts = (data || []).map((p: any) => ({
          ...p,
          priceValue: parseFloat(p.preco),
          durationDays: p.duracao_dias,
          icon: ICON_MAP[p.key] || <Monitor className="w-10 h-10 text-gray-400" />
        }));

        setProducts(mappedProducts);
      } catch (err) {
        console.error('Erro ao buscar produtos:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-ms-blue"></div>
      </div>
    );
  }

  return (
    <div className="px-[4px] py-4 w-full bg-[#f8f9fa] min-h-screen">
      <header className="mb-6 mt-2 px-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <img 
              src="https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg" 
              alt="MS" 
              className="h-4"
              referrerPolicy="no-referrer"
            />
            <span className="w-px h-3 bg-gray-300 mx-1"></span>
            <h1 className="text-xl font-bold text-[#1b1b1b]">{t('products.title')}</h1>
          </div>
          <button 
            onClick={() => navigate('/minhas-compras')}
            aria-label={t('profile.history')}
            title={t('profile.history')}
            className="w-10 h-10 bg-white border border-gray-100 flex items-center justify-center active:bg-gray-50 transition-colors"
          >
            <ReceiptText className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </header>

      <div className="space-y-3 pb-24">
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

