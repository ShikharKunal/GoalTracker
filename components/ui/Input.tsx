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
          border-black
          dark:border-white
          pb-2
          pt-1
          text-sm
          font-light
          text-black
          dark:text-white
          focus:outline-none
          focus:border-gray-400
          dark:focus:border-gray-600
          transition-colors
          duration-200
          ${className}
        `}
        {...props}
      />
    </div>
  );
}


