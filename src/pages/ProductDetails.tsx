import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Globe, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';
import { useLanguage } from '../contexts/LanguageContext';
import { supabase } from '../lib/supabase';
import { Monitor, ShieldCheck, Zap } from 'lucide-react';
import { useToast } from '../components/Toast';
import { Button } from '../components/Button';

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
    <div className="min-h-screen bg-white pb-10">
      {/* Header / Sub-nav */}
      <div className="border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 h-11 flex items-center justify-between text-[11px] font-bold text-gray-500 uppercase tracking-tight">
          <div className="flex items-center space-x-6">
            <button onClick={() => navigate('/produtos')} className="flex items-center hover:text-ms-blue transition-colors">
              <ChevronLeft className="w-4 h-4 mr-1" />
              Microsoft Cloud platform Net
            </button>
            <span className="text-gray-900 border-b-2 border-ms-blue h-11 flex items-center">{t('products.overview')}</span>
            <span className="text-gray-400 cursor-pointer h-11 flex items-center">{t('products.specs')}</span>
          </div>
          <div className="hidden sm:flex items-center space-x-4">
            <Globe className="w-3 h-3" />
            <span>{language === 'pt' ? 'Português' : language === 'en' ? 'English' : 'Français'}</span>
          </div>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-4 mt-6">
        <div className="flex flex-col md:flex-row gap-6 items-start">
          {/* Left: Product Image (Reduced Size) */}
          <div className="w-full md:w-48 flex-shrink-0">
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="h-32 md:h-48 border border-black/10 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.05)] flex items-center justify-center overflow-hidden rounded-sm"
            >
              {product.imagem_url ? (
                <img 
                  src={product.imagem_url} 
                  alt={product.nome} 
                  className="w-full h-full object-contain mix-blend-multiply opacity-90 p-2"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="transform scale-110">
                  {getIcon(product.key)}
                </div>
              )}
            </motion.div>
          </div>

          {/* Right: Info & CTA */}
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-[#1b1b1b] mb-1">{t(`${product.key}.name`)}</h1>
            <p className="text-ms-blue font-semibold text-xs mb-4">{t('products.available_now')}</p>
            
            <div className="text-sm text-gray-600 mb-6 leading-snug">
              <p className="mb-4">
                {t(`${product.key}.desc`)}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5">
                {features.map((feature, i) => (
                  <div key={i} className="flex items-center space-x-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#00a651]" />
                    <span className="text-[13px]">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-[#f0f0f0] p-5 border border-gray-200 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-8">
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">{t('products.daily_income')}</p>
                    <p className="text-xl font-bold text-gray-800">
                      {Number(product.renda_diaria).toLocaleString('pt-BR')} Kz / {t('product.unit.day')}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">{t('products.duration')}</p>
                    <p className="text-xl font-bold text-gray-800">
                      {product.duracao_dias} {product.duracao_dias === 1 ? t('product.unit.day') : t('product.unit.days')}
                    </p>
                  </div>
                </div>
                
                <div className="pt-2 border-t border-gray-300">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{t('products.total_price')}</p>
                  <p className="text-3xl font-black text-[#1b1b1b]">
                    {Number(product.preco).toLocaleString('pt-BR')} Kz
                  </p>
                </div>
              </div>

              <div className="w-full md:w-64 space-y-3">
                <div className="text-[10px] font-semibold space-y-1 py-2 border-y border-gray-300/60">
                  <div className="flex justify-between">
                    <span className="text-gray-400">{t('products.activation')}:</span>
                    <span className="text-gray-700">{today.toLocaleDateString(language === 'en' ? 'en-US' : language === 'fr' ? 'fr-FR' : 'pt-BR')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">{t('products.expiration')}:</span>
                    <span className="text-red-600 font-bold">{expirationDate.toLocaleDateString(language === 'en' ? 'en-US' : language === 'fr' ? 'fr-FR' : 'pt-BR')}</span>
                  </div>
                </div>

                <Button 
                  onClick={handleBuy}
                  isLoading={isBuying}
                  className="w-full py-2.5 text-sm shadow-sm"
                >
                  {t('products.btn_buy')}
                </Button>
                <p className="text-[9px] text-center text-gray-400 leading-tight">
                  {t('products.secure_payment')} <br />
                  {t('products.tech_support_24h')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
