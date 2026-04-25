import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Headset, HelpCircle, MessageSquare, X } from 'lucide-react';
import { useToast } from './Toast';

export default function FloatingSupport() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const menuOptions = [
    { 
      label: 'Suporte Microsoft Exchange', 
      icon: <Headset size={18} />, 
      path: '/suporte',
      color: 'bg-ms-blue'
    },
    { 
      label: 'FAQ / Ajuda', 
      icon: <HelpCircle size={18} />, 
      path: '/help-faq',
      color: 'bg-gray-800'
    },
    { 
      label: 'Comentários', 
      icon: <MessageSquare size={18} />, 
      path: '/suporte/feedback',
      color: 'bg-amber-600'
    }
  ];

  return (
    <div className="fixed bottom-24 right-6 z-[60] flex flex-col items-end space-y-3">
      {/* Sub-menu Items */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="flex flex-col items-end space-y-2 mb-2"
          >
            {menuOptions.map((option, index) => (
              <motion.button
                key={index}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => {
                  navigate(option.path);
                  setIsOpen(false);
                }}
                className="flex items-center space-x-3 group"
              >
                <span className="bg-white px-3 py-1.5 rounded-sm shadow-sm text-[10px] font-bold uppercase tracking-widest text-gray-700 opacity-0 group-hover:opacity-100 transition-opacity border border-gray-100">
                  {option.label}
                </span>
                <div className={`w-10 h-10 ${option.color} text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform`}>
                  {option.icon}
                </div>
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Draggable Toggle Button */}
      <motion.div
        drag
        dragMomentum={false}
        initial={{ x: 0, y: 0 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95, cursor: 'grabbing' }}
        className="cursor-grab touch-none"
      >
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="relative group focus:outline-none"
        >
          {/* Support Agent Avatar Container - Slightly Smaller */}
          <div className="w-14 h-14 rounded-full border-2 border-white shadow-[0_8px_24px_rgba(0,0,0,0.15)] bg-ms-blue overflow-hidden ring-4 ring-ms-blue/10 flex items-center justify-center">
            {isOpen ? (
              <X className="text-white w-6 h-6" />
            ) : (
              <img 
                src="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?q=80&w=200&h=200&auto=format&fit=crop" 
                alt="Suporte Microsoft Exchange" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            )}
          </div>

          {/* Online Indicator (only if closed) */}
          {!isOpen && (
            <div className="absolute bottom-1 right-1 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full shadow-sm animate-pulse" />
          )}

          {/* Label (Visible on hover desktop) */}
          <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-gray-900 text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-sm opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap hidden md:block">
            {isOpen ? 'Fechar Menu' : 'Centro de Ajuda'}
          </div>
        </button>
      </motion.div>
    </div>
  );
}
