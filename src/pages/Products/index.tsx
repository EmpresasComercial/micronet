import React from 'react';
import { ReceiptText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import { ProductCard } from './components/ProductCard';
import { supabase } from '../../lib/supabase';
import { Monitor, ShieldCheck, Zap } from 'lucide-react';

const ICON_MAP: Record<string, React.ReactNode> = {
  'product.win7': <Monitor className="w-10 h-10 text-blue-500" />,
  'product.win8': <ShieldCheck className="w-10 h-10 text-blue-600" />,
  'product.win10': <Zap className="w-10 h-10 text-blue-700" />,
  'product.win11': <Monitor className="w-10 h-10 text-blue-800" />,
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
        
        // Mapear dados do banco para o formato esperado pelo componente
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

