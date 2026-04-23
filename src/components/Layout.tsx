import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import Navbar from './Navbar';
import FloatingSupport from './FloatingSupport';

export default function Layout() {
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const allowedPaths = ['/home', '/produtos', '/convite', '/perfil'];
  const showNavbar = allowedPaths.includes(location.pathname);

  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800); // Progress bar duration

    return () => clearTimeout(timer);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-[#f2f2f2] font-sans text-[#1b1b1b]">
      {/* Loading Bar Container */}
      <div className="fixed top-0 left-0 right-0 z-[100] h-1 pointer-events-none">
        <AnimatePresence>
          {isLoading && (
            <motion.div
              initial={{ scaleX: 0, originX: 1 }} // Start from right to left as requested
              animate={{ scaleX: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
              className="w-full h-full bg-ms-blue shadow-[0_0_10px_rgba(0,103,184,0.3)]"
            />
          )}
        </AnimatePresence>
      </div>

      <main className={showNavbar ? 'pb-16' : ''}>
        <Outlet />
      </main>
      
      {showNavbar && (
        <>
          <FloatingSupport />
          <Navbar />
        </>
      )}
    </div>
  );
}
