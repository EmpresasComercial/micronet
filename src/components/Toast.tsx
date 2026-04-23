import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';
import { cn } from '@/src/lib/utils';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    setToast({ message, type });
    // Auto-hide after 3 seconds
    setTimeout(() => {
      setToast(null);
    }, 3000);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <AnimatePresence>
        {toast && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              className="pointer-events-auto max-w-sm w-full bg-white shadow-[0_20px_40px_rgba(0,0,0,0.15)] border border-[#d2d2d2] p-4 flex items-start space-x-3"
            >
              <div className={cn(
                "mt-0.5",
                toast.type === 'error' && "text-red-600",
                toast.type === 'success' && "text-green-600",
                toast.type === 'info' && "text-ms-blue",
                toast.type === 'warning' && "text-amber-500",
              )}>
                {toast.type === 'error' && <AlertCircle size={20} />}
                {toast.type === 'success' && <CheckCircle2 size={20} />}
                {toast.type === 'info' && <Info size={20} />}
                {toast.type === 'warning' && <AlertCircle size={20} />}
              </div>
              
              <div className="flex-1">
                <p className="text-sm font-medium text-[#1b1b1b] leading-tight">
                  {toast.message}
                </p>
              </div>

              <button 
                onClick={() => setToast(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={16} />
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
