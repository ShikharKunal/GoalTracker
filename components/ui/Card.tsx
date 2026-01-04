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
        bg-white
        p-6
        mb-4
        transition-colors
        duration-200
        hover:border-gray-300
        ${className}
      `}
    >
      {children}
    </div>
  );
}


