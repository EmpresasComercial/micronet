import React, { useState, useEffect } from 'react';
import { WifiOff, ZapOff, RefreshCcw, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from './Button';

export const ConnectivityOverlay: React.FC = () => {
  const [errorType, setErrorType] = useState<'offline' | 'timeout' | null>(null);
  const [activeRequests, setActiveRequests] = useState(0);

  useEffect(() => {
    const handleOffline = () => setErrorType('offline');
    const handleTimeout = () => setErrorType('timeout');
    const handleOnline = () => {
      if (errorType === 'offline') setErrorType(null);
    };

    const handleLoadingStart = () => setActiveRequests(prev => prev + 1);
    const handleLoadingEnd = () => setActiveRequests(prev => Math.max(0, prev - 1));

    window.addEventListener('app:offline', handleOffline);
    window.addEventListener('app:timeout', handleTimeout);
    window.addEventListener('online', handleOnline);
    window.addEventListener('app:loading-start', handleLoadingStart);
    window.addEventListener('app:loading-end', handleLoadingEnd);

    return () => {
      window.removeEventListener('app:offline', handleOffline);
      window.removeEventListener('app:timeout', handleTimeout);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('app:loading-start', handleLoadingStart);
      window.removeEventListener('app:loading-end', handleLoadingEnd);
    };
  }, [errorType]);

  const handleRetry = () => {
    setErrorType(null);
    window.location.reload();
  };

  return (
    <>
      {/* Global Loading Bar */}
      <AnimatePresence>
        {activeRequests > 0 && !errorType && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed top-0 left-0 right-0 h-0.5 z-[10000] overflow-hidden bg-transparent"
          >
            <motion.div 
              className="h-full bg-[#0067b8]"
              initial={{ x: "-100%" }}
              animate={{ x: "100%" }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {errorType && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white w-full max-w-sm rounded-sm shadow-2xl overflow-hidden border border-[#e1e1e1]"
            >
              <div className="p-8 text-center space-y-6">
                <div className="flex justify-center">
                  <div className="w-16 h-16 bg-[#f2f2f2] rounded-full flex items-center justify-center">
                    {errorType === 'offline' ? (
                      <WifiOff className="w-8 h-8 text-[#d83b01]" />
                    ) : (
                      <ZapOff className="w-8 h-8 text-[#ffb900]" />
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <h2 className="text-lg font-bold text-[#2b2b2b]">
                    {errorType === 'offline' ? 'Sem conexão' : 'Conexão lenta'}
                  </h2>
                  <p className="text-sm text-[#616161]">
                    {errorType === 'offline' 
                      ? 'Sem conexão com a internet. Verifique sua rede e tente novamente.' 
                      : 'A conexão está lenta ou instável. Tente novamente.'}
                  </p>
                </div>

                <div className="pt-4 flex flex-col space-y-3">
                  <Button onClick={handleRetry} className="w-full">
                    <RefreshCcw className="w-4 h-4 mr-2" />
                    Tentar Novamente
                  </Button>
                  <button 
                    onClick={() => setErrorType(null)}
                    className="text-xs font-bold text-[#616161] uppercase tracking-widest hover:text-[#2b2b2b]"
                  >
                    Fechar
                  </button>
                </div>
              </div>
              
              {/* Microsoft Footer Node for authenticity */}
              <div className="bg-[#f8f8f8] p-3 flex justify-center space-x-1 opacity-50">
                <div className="w-1.5 h-1.5 bg-[#f25022]" />
                <div className="w-1.5 h-1.5 bg-[#7fba00]" />
                <div className="w-1.5 h-1.5 bg-[#00a4ef]" />
                <div className="w-1.5 h-1.5 bg-[#ffb900]" />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
