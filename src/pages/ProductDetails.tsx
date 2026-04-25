import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, CheckCircle2, Monitor, ShieldCheck, Zap } from 'lucide-react';
import { motion } from 'motion/react';
import { useLanguage } from '../contexts/LanguageContext';
import { supabase } from '../lib/supabase';
import { useToast } from '../components/Toast';
import { Button } from '../components/Button';
import { SmartImage } from '../components/SmartImage';

export default function ProductDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { language, t } = useLanguage();
  const [isBuying, setIsBuying] = useState(false);
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    async function fetchProduct() {
      try {
        const { data, error } = await supabase.rpc('get_product_details_mcpn', {
          p_id: id
        });
        if (error) throw error;
        if (data && data.length > 0) {
          setProduct(data[0]);
        }
      } catch (err) {
        console.error('Erro ao buscar produto:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchProduct();
  }, [id]);

  const handleBuy = async () => {
    setIsBuying(true);
    try {
      const { data, error } = await supabase.rpc('buy_product_mcpn', {
        p_product_id: id
      });

      if (error) throw error;

      if (data.success) {
        showToast(data.message, 'success');
        navigate('/minhas-compras');
      } else {
        showToast(data.message, 'error');
      }
    } catch (error: any) {
      showToast(error.message || 'Erro ao processar compra', 'error');
    } finally {
      setIsBuying(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-ms-blue"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">{t('products.not_found')}</h2>
          <button onClick={() => navigate('/produtos')} className="ms-btn-primary">
            {t('products.back_to_list')}
          </button>
        </div>
      </div>
    );
  }

  const getIcon = (key: string) => {
    switch (key) {
      case 'product.win7': return <Monitor className="w-10 h-10 text-blue-500" />;
      case 'product.win8': return <ShieldCheck className="w-10 h-10 text-blue-600" />;
      case 'product.win10': return <Zap className="w-10 h-10 text-blue-700" />;
      case 'product.win11': return <Monitor className="w-10 h-10 text-blue-800" />;
      default: return <Monitor className="w-10 h-10 text-gray-500" />;
    }
  };

  const today = new Date();
  const expirationDate = new Date();
  expirationDate.setDate(today.getDate() + (product.duracao_dias || product.duration_dias));

  const features = [
    t(`${product.key}.feat1`),
    t(`${product.key}.feat2`),
    t(`${product.key}.feat3`),
    t(`${product.key}.feat4`),
  ];

  return (
    <div className="min-h-screen bg-[#f8f8f8] pb-32">
      <header className="bg-white/80 backdrop-blur-md p-4 flex items-center border-b border-[#e1e1e1] sticky top-0 z-50">
        <button 
          onClick={() => navigate('/produtos')} 
          className="p-2 -ml-2 text-[#616161] hover:text-ms-blue transition-colors"
          aria-label="Voltar"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="text-sm font-bold ml-2 text-[#2b2b2b]">Detalhes da Licença</h1>
      </header>

      <main className="max-w-2xl mx-auto">
        <div className="bg-white">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 pb-2"
          >
            <div className="bg-[#f3f3f3] rounded-sm aspect-video flex items-center justify-center overflow-hidden mb-6 group">
              {product.imagem_url ? (
                <SmartImage 
                  src={product.imagem_url} 
                  alt={product.nome} 
                  className="w-full h-full p-8 group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <div className="transform scale-[2.5] opacity-20">
                  {getIcon(product.key)}
                </div>
              )}
            </div>

            <div className="space-y-1 mb-6">
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-black text-[#1b1b1b] tracking-tight">{t(`${product.key}.name`)}</h1>
                <div className="bg-green-50 text-[#00a651] text-[10px] font-bold px-2 py-1 rounded-full border border-green-100 uppercase">
                  {t('products.active_badge')}
                </div>
              </div>
              <p className="text-ms-blue font-bold text-[11px] uppercase tracking-wider">{t('products.available_now')}</p>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-8">
              <div className="bg-[#f8f8f8] p-4 rounded-sm border border-gray-100">
                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">{t('products.daily_income')}</p>
                <p className="text-lg font-black text-gray-900 leading-none">
                  {Number(product.renda_diaria).toLocaleString('pt-BR')} <span className="text-[10px] font-medium text-gray-500">Kz</span>
                </p>
              </div>
              <div className="bg-[#f8f8f8] p-4 rounded-sm border border-gray-100">
                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">{t('products.duration')}</p>
                <p className="text-lg font-black text-gray-900 leading-none">
                  {product.duracao_dias} <span className="text-[10px] font-medium text-gray-500 uppercase">{product.duracao_dias === 1 ? t('product.unit.day') : t('product.unit.days')}</span>
                </p>
              </div>
            </div>

            <div className="space-y-4 mb-10">
              <h2 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-2">{t('products.overview')}</h2>
              <p className="text-sm text-[#444] leading-relaxed font-light">
                {t(`${product.key}.desc`)}
              </p>
              <div className="grid grid-cols-1 gap-2.5 pt-2">
                {features.map((feature, i) => (
                  <div key={i} className="flex items-center space-x-3 bg-gray-50/50 p-2.5 rounded-sm">
                    <CheckCircle2 className="w-4 h-4 text-[#00a651] shrink-0" />
                    <span className="text-xs text-gray-600 font-medium">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        <div className="p-6 bg-[#f8f8f8] space-y-6">
          <div className="bg-white p-5 rounded-sm border border-gray-200 shadow-sm space-y-4">
            <h2 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-2">Validade do Contrato</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-[10px] text-gray-400 font-bold uppercase">{t('products.activation')}</p>
                <p className="text-sm font-bold text-gray-700">{today.toLocaleDateString('pt-BR')}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] text-gray-400 font-bold uppercase">{t('products.expiration')}</p>
                <p className="text-sm font-bold text-red-600">{expirationDate.toLocaleDateString('pt-BR')}</p>
              </div>
            </div>
            <div className="pt-2 flex items-center space-x-2 text-[10px] text-gray-500 bg-blue-50/50 p-2 rounded-sm border border-blue-100/50">
              <ShieldCheck className="w-3.5 h-3.5 text-ms-blue" />
              <span>Proteção Microsoft Exchange Garantida</span>
            </div>
          </div>
        </div>
      </main>

      {/* Botão de Compra Fixo no Rodapé para Mobile */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/90 backdrop-blur-lg border-t border-gray-200 z-50 flex items-center justify-between max-w-2xl mx-auto shadow-[0_-8px_30px_rgb(0,0,0,0.04)]">
        <div className="flex flex-col">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">{t('products.total_price')}</span>
          <span className="text-xl font-black text-[#1b1b1b]">
            {Number(product.preco).toLocaleString('pt-BR')}<span className="text-xs font-bold ml-0.5">Kz</span>
          </span>
        </div>
        <Button 
          onClick={handleBuy}
          isLoading={isBuying}
          className="px-8 h-12 text-sm font-bold shadow-md shadow-ms-blue/20"
        >
          {t('products.btn_buy')}
        </Button>
      </div>
    </div>
  );
}
