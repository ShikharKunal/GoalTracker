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
        <label className="block text-sm font-light text-gray-700 mb-1">
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
          pb-2
          pt-1
          text-sm
          font-light
          text-black
          focus:outline-none
          focus:border-black
          transition-colors
          duration-200
          ${className}
        `}
        {...props}
      />
    </div>
  );
}


