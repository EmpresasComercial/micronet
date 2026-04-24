import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ShieldCheck } from 'lucide-react';
import { motion } from 'motion/react';
import { supabase } from '../lib/supabase';

export default function BankInfo() {
  const navigate = useNavigate();

  const [linkedBanks, setLinkedBanks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBanks() {
      try {
        const { data, error } = await supabase.rpc('get_my_bank_accounts_mcpn');
        if (error) throw error;
        if (data) setLinkedBanks(data);
      } catch (err) {
        console.error('Erro ao buscar bancos:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchBanks();
  }, []);

  const maskIban = (iban: string) => {
    if (!iban || iban.length < 21) return iban;
    const start = iban.slice(0, 4);
    const end = iban.slice(-4);
    return `${start} • • • • ${end}`;
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta conta bancária?')) {
      try {
        // RPC para deletar banco (opcional, mas bom ter)
        const { error } = await supabase
          .from('contas_bancarias_mcpn')
          .delete()
          .eq('id', id);
        
        if (error) throw error;
        
        setLinkedBanks(prev => prev.filter(b => b.id !== id));
        alert('Conta excluída com sucesso!');
      } catch (err: any) {
        alert('Erro ao excluir: ' + err.message);
      }
    }
  };

  return (
    <div className="min-h-screen bg-ms-bg pb-20">
      <header className="bg-white p-4 flex items-center border-b border-[#e1e1e1]">
        <button onClick={() => navigate('/perfil')} className="p-2 -ml-2 text-[#616161] hover:text-[#2b2b2b]">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="text-sm font-semibold ml-2 text-[#2b2b2b]">Conta Microsoft</h1>
      </header>

      <div className="p-6 max-w-lg mx-auto">
        <div className="mb-10">
          <h2 className="text-3xl font-light text-[#2b2b2b] mb-3">Pagamento e cobrança</h2>
          <p className="text-sm text-[#616161]">Gerencie como você recebe fundos e verifique o status de verificação de suas contas.</p>
        </div>
        
        <div className="space-y-6">
          {linkedBanks.map((bank) => (
            <motion.div
              key={bank.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white border border-[#e1e1e1] shadow-[0_2px_4px_rgba(0,0,0,0.05)] rounded-sm"
            >
              <div className="p-6">
                <div className="space-y-5">
                  <div className="flex justify-between items-start border-b border-[#f3f3f3] pb-4">
                    <div>
                      <h3 className="text-base font-semibold text-[#2b2b2b]">{bank.bank_name}</h3>
                      <p className="text-sm text-gray-500 font-mono tracking-tight">{maskIban(bank.iban)}</p>
                    </div>
                    <div className="flex items-center text-[#107c10] text-[11px] font-bold uppercase tracking-wider bg-[#dff6dd] px-2 py-1 rounded-sm">
                      <ShieldCheck size={12} className="mr-1" /> Verificado
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Nome do titular</div>
                      <p className="text-[#2b2b2b] text-sm font-medium">{bank.owner_name}</p>
                    </div>
                  </div>

                  <div className="pt-4 flex flex-col space-y-3">
                    <button 
                      onClick={() => handleDelete(bank.id)}
                      className="text-sm text-[#a4262c] font-semibold hover:underline flex items-center justify-start"
                    >
                      Remover este método de pagamento
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}

          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            onClick={() => navigate('/adicionar-banco')}
            className="w-full py-3 border border-[#0067b8] text-[#0067b8] font-semibold hover:bg-[#0067b8]/5 transition-colors text-sm rounded-sm"
          >
            + Adicionar um novo método de pagamento
          </motion.button>

          {/* Microsoft Standard Terms/Info Section */}
          <div className="mt-16 pt-10 border-t border-[#e1e1e1] space-y-6">
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-[#2b2b2b]">Segurança e conformidade</h4>
              <p className="text-xs text-[#616161] leading-relaxed">
                As informações da sua conta bancária são armazenadas de forma segura e criptografada. A <strong>Microsoft Cloud platform Net</strong> segue os padrões globais de conformidade financeira para garantir que suas transações sejam sempre protegidas.
              </p>
            </div>
            
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-[#2b2b2b]">Informações adicionais</h4>
              <div className="grid grid-cols-1 gap-3">
                <button className="text-xs text-[#0067b8] hover:underline flex items-center">Contrato de Serviços da Microsoft</button>
                <button className="text-xs text-[#0067b8] hover:underline flex items-center">Política de Privacidade de dados financeiros</button>
                <button className="text-xs text-[#0067b8] hover:underline flex items-center">Gerenciar permissões de faturamento</button>
              </div>
            </div>
            
            <div className="pt-4">
              <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">
                ID da Entidade: MS-SEC-8842-ANG
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
