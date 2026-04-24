import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Server, Users, UserCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';
import { useLanguage } from '../contexts/LanguageContext';

export default function Navbar() {
  const { t } = useLanguage();
  const navItems = [
    { name: t('nav.home'), path: '/home', icon: Home },
    { name: t('nav.products'), path: '/produtos', icon: Server },
    { name: t('nav.invite'), path: '/convite', icon: Users },
    { name: t('nav.profile'), path: '/perfil', icon: UserCircle },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-[#e5e5e5] h-[58px] flex items-center justify-around pb-safe">
      {navItems.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          className={({ isActive }) =>
            cn(
              'flex flex-col items-center justify-center transition-all w-full h-full relative group',
              isActive ? 'text-[#0067b8]' : 'text-[#616161] hover:text-[#0067b8]'
            )
          }
        >
          {({ isActive }) => (
            <>
              <item.icon 
                strokeWidth={isActive ? 2.5 : 2}
                className={cn("w-5 h-5 mb-1 transition-all duration-300", isActive && "scale-110")} 
              />
              <span className={cn(
                "text-[10px] font-bold uppercase tracking-widest transition-all",
                isActive ? "opacity-100" : "opacity-80"
              )}>
                {item.name}
              </span>
              {isActive && (
                <motion.div 
                  layoutId="nav-indicator"
                  className="absolute -top-[1px] w-8 h-[2px] bg-[#0067b8]"
                />
              )}
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}
