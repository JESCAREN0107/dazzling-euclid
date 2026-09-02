import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'gold' | 'rose' | 'sage' | 'slate' | 'success' | 'warning' | 'danger';
  className?: string;
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({ 
  children, 
  variant = 'rose', 
  className = '',
  size = 'md'
}) => {
  const variantStyles = {
    gold: 'bg-amber-50 text-amber-800 border-amber-200/60',
    rose: 'bg-spa-100 text-spa-800 border-spa-300/60',
    sage: 'bg-sage-100 text-sage-800 border-sage-300/60',
    slate: 'bg-slate-100 text-slate-700 border-slate-200',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    danger: 'bg-rose-50 text-rose-700 border-rose-200',
  };

  const sizeStyles = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-xs px-3 py-1 font-medium',
  };

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}>
      {children}
    </span>
  );
};
