import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export default function Card({ children, className = '' }: CardProps) {
  return (
    <div
      className={`
        border
        border-gray-200
        dark:border-gray-800
        bg-white
        dark:bg-black
        p-6
        mb-4
        transition-colors
        duration-200
        hover:border-gray-300
        dark:hover:border-gray-700
        ${className}
      `}
    >
      {children}
    </div>
  );
}


