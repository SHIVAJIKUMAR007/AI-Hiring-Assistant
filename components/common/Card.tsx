
import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = '' }) => {
  return (
    <div className={`bg-gray-50/70 border border-gray-200 rounded-lg p-4 sm:p-6 ${className}`}>
      {children}
    </div>
  );
};
