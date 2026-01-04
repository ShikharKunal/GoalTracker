import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export default function Input({ 
  label,
  className = '',
  ...props 
}: InputProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-light text-gray-700 dark:text-gray-300 mb-1">
          {label}
        </label>
      )}
      <input
        className={`
          w-full
          bg-transparent
          border-0
          border-b-2
          border-[#6a6a6a]
          dark:border-[#6a6a6a]
          pb-2
          pt-1
          text-sm
          font-light
          text-[#2a2a2a]
          dark:text-[#e5e5e5]
          focus:outline-none
          focus:border-[#4a4a4a]
          dark:focus:border-[#8a8a8a]
          transition-colors
          duration-200
          ${className}
        `}
        {...props}
      />
    </div>
  );
}


