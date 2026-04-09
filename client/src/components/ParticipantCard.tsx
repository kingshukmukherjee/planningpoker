import React from 'react';
import { cn } from '@/lib/utils';
import { Crown } from 'lucide-react';

interface Participant {
  id: string;
  name: string;
  vote: string | null;
  isHost?: boolean;
}

interface ParticipantCardProps {
  participant: Participant;
  revealed: boolean;
  isCurrentUser?: boolean;
}

export const ParticipantCard: React.FC<ParticipantCardProps> = ({
  participant,
  revealed,
  isCurrentUser = false,
}) => {
  const hasVoted = participant.vote !== null;
  const initials = participant.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div
      className={cn(
        "flex flex-col items-center space-y-2 p-4 rounded-xl transition-all duration-300",
        isCurrentUser && "bg-dhl-yellow/10 ring-2 ring-dhl-yellow"
      )}
    >
      {/* Avatar */}
      <div className="relative">
        <div
          className={cn(
            "participant-avatar",
            hasVoted && !revealed && "ring-4 ring-green-400 ring-opacity-50"
          )}
        >
          {initials}
        </div>
        
        {/* Host Crown */}
        {participant.isHost && (
          <div className="absolute -top-2 -right-2 bg-dhl-yellow rounded-full p-1">
            <Crown className="w-3 h-3 text-dhl-red" />
          </div>
        )}
        
        {/* Vote Status Indicator */}
        {hasVoted && !revealed && (
          <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
            <svg
              className="w-3 h-3 text-white"
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
      </div>

      {/* Name */}
      <span className="text-sm font-medium text-gray-700 text-center truncate max-w-[80px]">
        {participant.name}
        {isCurrentUser && <span className="text-xs text-dhl-red ml-1">(You)</span>}
      </span>

      {/* Vote Card */}
      <div
        className={cn(
          "w-12 h-16 rounded-lg flex items-center justify-center transition-all duration-500",
          "border-2 shadow-sm",
          revealed && hasVoted
            ? "bg-white border-dhl-yellow"
            : hasVoted
            ? "bg-gradient-to-br from-dhl-red to-dhl-darkRed border-dhl-red"
            : "bg-gray-100 border-gray-200"
        )}
        style={{
          transformStyle: 'preserve-3d',
          transform: revealed && hasVoted ? 'rotateY(0deg)' : 'rotateY(0deg)',
        }}
      >
        {revealed && hasVoted ? (
          <span className="text-xl font-bold text-dhl-red">
            {participant.vote}
          </span>
        ) : hasVoted ? (
          <span className="text-white text-lg">?</span>
        ) : (
          <span className="text-gray-400 text-sm">-</span>
        )}
      </div>
    </div>
  );
};

export default ParticipantCard;
