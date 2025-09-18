import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
  // FIX: Add size prop to allow for different button sizes.
  size?: 'sm' | 'md';
}

export const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', size = 'md', ...props }) => {
  // FIX: Remove sizing classes from baseClasses to be handled by the size prop.
  const baseClasses = "inline-flex items-center justify-center gap-2 font-semibold rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed";

  const variantClasses = {
    primary: 'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500',
    secondary: 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 focus:ring-primary-500',
  };

  // FIX: Define classes for different button sizes.
  const sizeClasses = {
    md: 'px-4 py-2 text-sm',
    sm: 'px-3 py-1.5 text-xs',
  };

  return (
    <button className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]}`} {...props}>
      {children}
    </button>
  );
};
