
import React from 'react';

const RobotIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M15 8h-2V6h2V4h2v2h2v2h-2v2h-2V8zM5 8h6v2H5V8zm14 8H5v-2h14v2zM5 14h6v2H5v-2zM21 2H3c-1.1 0-2 .9-2 2v16h20V4c0-1.1-.9-2-2-2zM8 6c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3zm8 12c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3-3z"/>
    </svg>
);


export const Header: React.FC = () => {
  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4 py-4 flex items-center justify-center">
        <RobotIcon className="w-8 h-8 text-primary-600 mr-3" />
        <h1 className="text-2xl font-bold text-gray-800 tracking-tight">
          AI Hiring Support Agent
        </h1>
      </div>
    </header>
  );
};
