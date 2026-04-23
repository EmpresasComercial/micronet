import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Gift, User, ShoppingBag } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { useLanguage } from '../contexts/LanguageContext';

export default function Navbar() {
  const { t } = useLanguage();
  const navItems = [
    { name: t('nav.home'), path: '/home', icon: Home },
    { name: t('nav.products'), path: '/produtos', icon: ShoppingBag },
    { name: t('nav.invite'), path: '/convite', icon: Gift },
    { name: t('nav.profile'), path: '/perfil', icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-[#d2d2d2] h-16 flex items-center justify-around pb-safe">
      {navItems.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          className={({ isActive }) =>
            cn(
              'flex flex-col items-center justify-center transition-all w-full h-full relative active:scale-95',
              isActive ? 'text-ms-blue' : 'text-[#666] hover:text-gray-900'
            )
          }
        >
          {({ isActive }) => (
            <>
              <item.icon className={cn("w-6 h-6 mb-1 transition-transform", isActive && "scale-110")} />
              <span className="text-[11px] font-bold uppercase tracking-widest">{item.name}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}
