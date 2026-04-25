import React from 'react';
import { NavLink } from 'react-router-dom';
import { House, LayoutGrid, UserPlus, CircleUserRound } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';
import { useLanguage } from '../contexts/LanguageContext';

export default function Navbar() {
  const { t } = useLanguage();

  const navItems = [
    { name: t('nav.home'),     path: '/home',    icon: House },
    { name: t('nav.products'), path: '/produtos', icon: LayoutGrid },
    { name: t('nav.invite'),   path: '/convite',  icon: UserPlus },
    { name: t('nav.profile'),  path: '/perfil',   icon: CircleUserRound },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-[#e5e5e5] h-[52px] flex items-center justify-around">
      {navItems.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          className={({ isActive }: { isActive: boolean }) =>
            cn(
              'flex flex-col items-center justify-center gap-0.5 transition-all w-full h-full relative group',
              isActive ? 'text-[#0067b8]' : 'text-[#9e9e9e] hover:text-[#0067b8]'
            )
          }
        >
          {({ isActive }: { isActive: boolean }) => (
            <>
              <motion.div
                animate={isActive ? { scale: 1.1, y: -1 } : { scale: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              >
                <item.icon
                  strokeWidth={isActive ? 2 : 1.6}
                  className="w-[18px] h-[18px]"
                />
              </motion.div>
              <span className={cn(
                'text-[9px] font-semibold uppercase tracking-[0.08em] transition-all',
                isActive ? 'opacity-100' : 'opacity-60'
              )}>
                {item.name}
              </span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}
