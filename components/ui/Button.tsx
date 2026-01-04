import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'default' | 'outline';
}

export default function Button({ 
  children, 
  variant = 'default',
  className = '',
  ...props 
}: ButtonProps) {
  const baseClasses = 'button-3d px-6 py-2 text-sm font-light';
  
  const variantClasses = variant === 'default' 
    ? 'border-2 bg-white dark:bg-[#1a1a1a] text-[#2a2a2a] dark:text-[#e5e5e5] hover:bg-[#f8f8f8] dark:hover:bg-[#2a2a2a]'
    : 'border-2 bg-white dark:bg-[#1a1a1a] text-[#2a2a2a] dark:text-[#e5e5e5] hover:bg-[#f8f8f8] dark:hover:bg-[#2a2a2a]';
  
  return (
    <button
      className={`${baseClasses} ${variantClasses} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}


