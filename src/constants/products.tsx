import React from 'react';
import { Monitor, ShieldCheck, Zap } from 'lucide-react';

export interface Product {
  id: string;
  key: string; // Base key for translations (e.g., 'product.win7')
  priceValue: number;
  durationDays: number;
  size: string;
  icon: React.ReactNode;
  imageUrl: string;
}

export const products: Product[] = [
  {
    id: '1',
    key: 'product.win7',
    priceValue: 5000,
    durationDays: 30,
    size: '3.8 GB',
    icon: <Monitor className="w-10 h-10 text-blue-500" />,
    imageUrl: 'https://images.unsplash.com/photo-1625032549247-498188169824?q=80&w=800&auto=format&fit=crop',
  },
  {
    id: '2',
    key: 'product.win8',
    priceValue: 15000,
    durationDays: 45,
    size: '4.2 GB',
    icon: <ShieldCheck className="w-10 h-10 text-blue-600" />,
    imageUrl: 'https://images.unsplash.com/photo-1542317148-8b4398105771?q=80&w=800&auto=format&fit=crop',
  },
  {
    id: '3',
    key: 'product.win10',
    priceValue: 50000,
    durationDays: 60,
    size: '5.4 GB',
    icon: <Zap className="w-10 h-10 text-blue-700" />,
    imageUrl: 'https://images.unsplash.com/photo-1587620962725-abab7fe55159?q=80&w=800&auto=format&fit=crop',
  },
  {
    id: '4',
    key: 'product.win11',
    priceValue: 120000,
    durationDays: 90,
    size: '6.2 GB',
    icon: <Monitor className="w-10 h-10 text-blue-800" />,
    imageUrl: 'https://images.unsplash.com/photo-1633419461186-7d40a38105ec?q=80&w=800&auto=format&fit=crop',
  },
];
