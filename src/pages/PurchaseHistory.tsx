import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ReceiptText, Laptop, Server, Cpu, ExternalLink, Download } from 'lucide-react';
import { motion } from 'motion/react';
import { supabase } from '../lib/supabase';
import { useEffect, useState } from 'react';

export default function PurchaseHistory() {
  const navigate = useNavigate();
  const [purchases, setPurchases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPurchases() {
      try {
        const { data, error } = await supabase
          .from('user_produtos')
          .select(`
            id,
            preco_pago,
            data_inicio,
            data_fim,
            dias_restantes,
            ativo,
            produtos (
              nome,
              imagem_url
            )
          `)
          .order('created_at', { ascending: false });

        if (error) throw error;
        if (data) setPurchases(data);
      } catch (err: any) {
        console.error('Erro ao buscar compras:', err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchPurchases();
  }, []);

  return (
    <div className="min-h-screen bg-ms-bg pb-20">
      <header className="bg-white p-4 flex items-center border-b border-[#d2d2d2] sticky top-0 z-10">
        <button onClick={() => navigate('/perfil')} className="p-2 -ml-2 text-gray-600" title="Voltar">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-semibold ml-2 text-gray-900">Minhas Licenças</h1>
      </header>

      <div className="p-4 max-w-2xl mx-auto space-y-4">
        {loading ? (
          <div className="text-center py-20 text-gray-400">Sincronizando com os servidores Microsoft...</div>
        ) : purchases.length === 0 ? (
          <div className="text-center py-20 text-gray-400">Nenhuma licença ativa encontrada.</div>
        ) : purchases.map((item, idx) => (
          <motion.div 
            key={item.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="ms-card p-0 overflow-hidden bg-white border border-[#e1e1e1] shadow-sm flex flex-col"
          >
            {/* Microsoft Header Style for each item */}
            <div className="bg-[#f2f2f2] px-4 py-2 flex justify-between items-center border-b border-[#e1e1e1] text-[10px] font-bold text-gray-500 uppercase tracking-tight">
              <span>Licença ID: {item.id.toString().substring(0, 8).toUpperCase()}</span>
              <span>Ativada em: {new Date(item.data_inicio).toLocaleDateString('pt-AO')}</span>
            </div>

            <div className="p-4 flex space-x-6 items-start">
              {/* Product Image */}
              <div className="w-20 h-20 shrink-0 overflow-hidden border border-[#f2f2f2] bg-[#fbfbfb] flex items-center justify-center">
                <img 
                  src={item.produtos?.imagem_url} 
                  className="w-full h-full object-cover mix-blend-multiply opacity-80" 
                  alt={item.produtos?.nome}
                  referrerPolicy="no-referrer"
                />
              </div>

              {/* Product Info */}
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-bold text-gray-900 mb-1">{item.produtos?.nome}</h3>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-3 gap-x-6 mb-4">
                  <div className="space-y-0.5">
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">Investimento</p>
                    <p className="text-xs font-bold text-gray-900 leading-none">{Number(item.preco_pago).toLocaleString()},00 Kz</p>
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">Status</p>
                    <p className={cn(
                      "text-xs font-bold leading-none",
                      item.ativo ? "text-green-600" : "text-red-500"
                    )}>
                      {item.ativo ? "Ativo e Rendendo" : "Expirado"}
                    </p>
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">Duração Restante</p>
                    <p className="text-xs font-bold text-ms-blue leading-none">{item.dias_restantes} Dias</p>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <button 
                    onClick={() => alert(`Acessando terminal remoto: ${item.produtos?.nome}`)}
                    className="text-ms-blue text-[10px] font-bold uppercase tracking-wider hover:underline flex items-center"
                  >
                    <ExternalLink className="w-3 h-3 mr-1" />
                    Gerenciar Servidor
                  </button>
                  <span className="text-gray-200">|</span>
                  <div className="flex items-center text-gray-400 text-[10px] font-bold uppercase tracking-wider">
                    <Download className="w-3 h-3 mr-1" />
                    Backup ISO
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}

        <div className="text-center py-6 opacity-30 mt-4 border-t border-gray-300 max-w-xs mx-auto">
          <img 
            src="https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg"
            alt="MS" 
            className="h-3.5 mx-auto"
            referrerPolicy="no-referrer"
          />
        </div>
      </div>
    </div>
  );
}
