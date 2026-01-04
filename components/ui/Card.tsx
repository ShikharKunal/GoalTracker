import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export default function Card({ children, className = '' }: CardProps) {
  return (
    <div
      className={`
        card-3d
        border-2
        border-black
        dark:border-white
        bg-white
        dark:bg-black
        p-6
        mb-4
        transition-all
        duration-200
        hover:border-gray-400
        dark:hover:border-gray-600
        ${className}
      `}
    >
      {children}
    </div>
  );
}


