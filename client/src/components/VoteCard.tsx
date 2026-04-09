import React from 'react';
import { cn } from '@/lib/utils';

interface VoteCardProps {
  value: string;
  selected?: boolean;
  disabled?: boolean;
  onClick?: () => void;
}

export const VoteCard: React.FC<VoteCardProps> = ({
  value,
  selected = false,
  disabled = false,
  onClick,
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "relative w-20 h-28 sm:w-24 sm:h-32 rounded-xl transition-all duration-200 transform",
        "border-2 shadow-md hover:shadow-xl",
        "flex items-center justify-center",
        "font-bold text-2xl sm:text-3xl",
        selected
          ? "bg-dhl-yellow border-dhl-red text-dhl-red scale-105 ring-4 ring-dhl-red/30"
          : "bg-white border-gray-200 text-gray-700 hover:border-dhl-yellow hover:-translate-y-1",
        disabled && "opacity-50 cursor-not-allowed hover:transform-none"
      )}
    >
      {/* Card Pattern/Design */}
      <div className="absolute inset-2 border border-gray-100 rounded-lg pointer-events-none" />
      
      {/* Value */}
      <span className="relative z-10">{value}</span>
      
      {/* Selection Indicator */}
      {selected && (
        <div className="absolute -top-2 -right-2 w-6 h-6 bg-dhl-red rounded-full flex items-center justify-center">
          <svg
            className="w-4 h-4 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={3}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
      )}
    </button>
  );
};

export default VoteCard;
