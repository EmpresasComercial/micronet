import React from 'react';
import { Globe } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { cn } from '../lib/utils';

interface LanguageSelectorProps {
  className?: string;
  variant?: 'minimal' | 'bordered';
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({ className, variant = 'bordered' }) => {
  const { language, setLanguage } = useLanguage();

  return (
    <div className={cn("relative group", className)}>
      <div className={cn(
        "p-2 text-gray-400 hover:text-ms-blue transition-colors cursor-pointer flex items-center space-x-1 backdrop-blur-sm rounded-sm border transition-all duration-200",
        variant === 'bordered' ? "bg-white/50 border-transparent hover:border-gray-200" : "bg-transparent border-transparent"
      )}>
        <Globe size={18} strokeWidth={1.5} />
        <span className="text-[10px] font-bold uppercase tracking-widest">{language}</span>
      </div>
      <select 
        value={language}
        onChange={(e) => setLanguage(e.target.value as any)}
        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
      >
        <option value="pt">Português</option>
        <option value="en">English</option>
        <option value="fr">Français</option>
      </select>
    </div>
  );
};
