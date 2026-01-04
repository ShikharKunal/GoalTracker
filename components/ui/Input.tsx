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
          border-b
          border-gray-300
          dark:border-gray-700
          pb-2
          pt-1
          text-sm
          font-light
          text-black
          dark:text-white
          focus:outline-none
          focus:border-black
          dark:focus:border-white
          transition-colors
          duration-200
          ${className}
        `}
        {...props}
      />
    </div>
  );
}


