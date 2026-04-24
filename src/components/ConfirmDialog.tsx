import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertCircle, X } from 'lucide-react';
import { Button } from './Button';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'primary';
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  variant = 'primary'
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-sm rounded-sm shadow-2xl overflow-hidden border border-[#e1e1e1]">
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className={variant === 'danger' ? 'text-red-600' : 'text-ms-blue'}>
                <AlertCircle size={24} />
              </div>
              <h3 className="text-lg font-bold text-[#2b2b2b]">{title}</h3>
            </div>
            <button 
              onClick={onClose} 
              className="text-gray-400 hover:text-gray-600 transition-colors"
              title="Fechar"
              aria-label="Fechar diálogo"
            >
              <X size={20} />
            </button>
          </div>
          
          <p className="text-sm text-[#616161] leading-relaxed mb-8">
            {message}
          </p>
          
          <div className="flex flex-col space-y-3">
            <Button 
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className={variant === 'danger' ? 'bg-red-600 hover:bg-red-700 border-red-700' : ''}
            >
              {confirmText}
            </Button>
            <button 
              onClick={onClose}
              className="w-full py-2 text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-gray-800 transition-colors"
            >
              {cancelText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
