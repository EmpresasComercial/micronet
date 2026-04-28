import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';
import { useLanguage } from '../contexts/LanguageContext';

export default function Navbar() {
  const { t } = useLanguage();

  const navItems = [
    { name: t('nav.home'),     path: '/home',    img: '/home.png' },
    { name: t('nav.products'), path: '/produtos', img: '/compar.pgn.png' },
    { name: t('nav.invite'),   path: '/convite',  img: '/invite.png' },
    { name: t('nav.profile'),  path: '/perfil',   img: '/perfil,pbg.webp' },
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
                <img
                  src={item.img}
                  alt={item.name}
                  className={cn(
                    'w-[20px] h-[20px] object-contain transition-all',
                    isActive ? 'opacity-100' : 'opacity-50'
                  )}
                />
              </motion.div>
              <span className={cn(
                'text-[9px] font-semibold uppercase tracking-[0.08em] transition-all',
                isActive ? 'opacity-100 text-[#0067b8]' : 'opacity-60'
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
