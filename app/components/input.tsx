import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
}

export default function Input({ className, ...props }: InputProps) {
  return (
    <input
      className={`rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#6cbe45] focus:border-transparent ${className}`}
      {...props}
    />
  );
}