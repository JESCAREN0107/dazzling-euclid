import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'whatsapp';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  children,
  icon,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium transition-all duration-200 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]';

  const sizeStyles = {
    sm: 'text-xs px-3.5 py-1.5 gap-1.5',
    md: 'text-sm px-5 py-2.5 gap-2',
    lg: 'text-base px-7 py-3.5 gap-2.5 shadow-soft',
  };

  const variantStyles = {
    primary: 'bg-gradient-to-r from-spa-600 to-spa-500 hover:from-spa-700 hover:to-spa-600 text-white shadow-md shadow-spa-500/20 focus:ring-spa-400',
    secondary: 'bg-spa-100 text-spa-900 hover:bg-spa-200 focus:ring-spa-300',
    outline: 'border-2 border-spa-400/80 text-spa-800 hover:bg-spa-50 focus:ring-spa-300',
    ghost: 'text-slate-600 hover:text-spa-800 hover:bg-spa-50/80',
    whatsapp: 'bg-[#25D366] hover:bg-[#20bd5a] text-white shadow-md shadow-[#25D366]/25 focus:ring-[#25D366]',
  };

  return (
    <button
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      disabled={disabled}
      {...props}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      <span>{children}</span>
    </button>
  );
};
