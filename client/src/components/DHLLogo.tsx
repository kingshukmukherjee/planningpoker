import React from 'react';

interface DHLLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const DHLLogo: React.FC<DHLLogoProps> = ({ className = '', size = 'md' }) => {
  const sizes = {
    sm: 'h-6',
    md: 'h-8',
    lg: 'h-12',
  };

  return (
    <div className={`flex items-center ${className}`}>
      <svg
        viewBox="0 0 200 40"
        className={`${sizes[size]} w-auto`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* DHL Yellow Background */}
        <rect width="200" height="40" rx="4" fill="#FFCC00" />
        
        {/* DHL Red Text */}
        <text
          x="50%"
          y="50%"
          dominantBaseline="middle"
          textAnchor="middle"
          fill="#D40511"
          fontFamily="Arial Black, Arial, sans-serif"
          fontWeight="900"
          fontSize="28"
          letterSpacing="2"
        >
          DHL
        </text>
      </svg>
      <span className="ml-3 text-white font-bold text-xl hidden sm:inline">
        Planning Poker
      </span>
    </div>
  );
};

export default DHLLogo;
