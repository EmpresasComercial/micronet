import React, { useState, useEffect } from 'react';
import {
  ArrowUpRight,
  ArrowDownLeft,
  Settings2,
  LogOut,
  ChevronRight,
  UserCheck,
  Ticket,
  Activity,
  Coins,
  Landmark,
  Info,
  Globe,
  ScrollText,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import { BalanceCard } from './components/BalanceCard';
import { CurrencyType } from '../../lib/currency';
import { supabase } from '../../lib/supabase';

export default function Profile() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const [currency, setCurrencyState] = useState<CurrencyType>(() => {
    const saved = localStorage.getItem('app_currency') as CurrencyType;
    return (saved === 'KZ' || saved === 'USDT') ? saved : 'KZ';
  });

  const setCurrency = (c: CurrencyType) => {
    setCurrencyState(c);
    localStorage.setItem('app_currency', c);
  };

  const [accountData, setAccountData] = useState({
    saldo_disponivel: 0,
    lucro_acumulado: 0,
    total_recarregado: 0,
    total_retirado: 0,
    total_comissao_equipe: 0,
    telefone: ''
  });

  useEffect(() => {
    async function fetchProfile() {
      try {
        const { data, error } = await supabase.rpc('get_my_account_data');
        if (error) throw error;
        if (data && data.length > 0) {
          setAccountData(data[0]);
        }
      } catch (error: any) {
        console.error('Erro ao carregar perfil:', error.message);
      }
    }

    fetchProfile();

    const channel = supabase
      .channel('account_user_realtime')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'account_user' },
        () => { fetchProfile(); }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const sections = [
    { name: t('profile.withdraw'), icon: ArrowUpRight, path: '/retirada' },
    { name: t('profile.recharge'), icon: ArrowDownLeft, path: '/recarregar' },
    { name: t('profile.recharge_usdt'), icon: Coins, path: '/recharge-usdt' },
    { name: t('profile.operations'), icon: Activity, path: '/operacoes' },
    { name: t('settings.authenticate'), icon: UserCheck, path: '/autenticacao' },
    { name: t('profile.bank_link'), icon: Landmark, path: '/adicionar-banco' },
    { name: t('profile.bank_info'), icon: Info, path: '/informacao-bancaria' },
    { name: t('profile.history'), icon: ScrollText, path: '/historico-atividades' },
    { name: t('profile.coupons'), icon: Ticket, path: '/resgate' },
    { name: t('profile.about'), icon: Globe, path: '/sobre-microsoft' },
    { name: t('profile.settings'), icon: Settings2, path: '/configuracoes-conta' },
  ];

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <header className="mb-8">
        <img
          src="https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg"
          alt="MS"
          className="h-5 mb-6"
          referrerPolicy="no-referrer"
        />
        <h1 className="text-2xl font-semibold">{t('nav.profile')}</h1>
      </header>

      <BalanceCard
        balance={accountData.saldo_disponivel}
        recharge={accountData.total_recarregado}
        profit={accountData.lucro_acumulado}
        withdrawn={accountData.total_retirado}
        teamCommission={accountData.total_comissao_equipe}
        currency={currency}
        setCurrency={setCurrency}
        onRecharge={() => navigate('/recarregar')}
        onWithdraw={() => navigate('/retirada')}
      />

      <div className="ms-card overflow-hidden">
        <div className="flex flex-col divide-y divide-gray-50">
          {sections.map((item, idx) => (
            <div
              key={idx}
              onClick={() => navigate(item.path)}
              className="flex items-center justify-between px-6 py-4 cursor-pointer group hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center space-x-6">
                <div className="flex-shrink-0 transition-transform group-hover:scale-110">
                  <item.icon className="w-7 h-7 text-gray-700" strokeWidth={1.5} />
                </div>
                <span className="text-[15px] font-medium text-gray-700">{item.name}</span>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-ms-blue transition-colors" />
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={handleLogout}
        className="w-full flex items-center justify-center space-x-2 py-4 text-red-600 font-bold border border-red-100 rounded-sm hover:bg-red-50 transition-colors uppercase text-xs tracking-widest"
      >
        <LogOut className="w-5 h-5" />
        <span>{t('profile.logout')}</span>
      </button>

      <div className="text-center py-8 text-gray-300">
        <p className="text-[10px] uppercase font-bold tracking-[0.2em]">Microsoft Exchange © 2026</p>
      </div>
    </div>
  );
}
