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
  const baseClasses = 'px-6 py-2 text-sm font-light transition-all duration-200';
  
  const variantClasses = variant === 'default' 
    ? 'border border-black dark:border-white bg-white dark:bg-black text-black dark:text-white hover:bg-black dark:hover:bg-white hover:text-white dark:hover:text-black'
    : 'border border-black dark:border-white bg-white dark:bg-black text-black dark:text-white hover:bg-black dark:hover:bg-white hover:text-white dark:hover:text-black';
  
  return (
    <button
      className={`${baseClasses} ${variantClasses} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}


