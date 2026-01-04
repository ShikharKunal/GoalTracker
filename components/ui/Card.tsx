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
        bg-white
        dark:bg-[#1a1a1a]
        p-6
        mb-4
        transition-all
        duration-200
        hover:shadow-[3px_3px_0px_0px_rgba(106,106,106,0.15),6px_6px_0px_0px_rgba(106,106,106,0.08)]
        dark:hover:shadow-[3px_3px_0px_0px_rgba(106,106,106,0.25),6px_6px_0px_0px_rgba(106,106,106,0.12)]
        ${className}
      `}
    >
      {children}
    </div>
  );
}


