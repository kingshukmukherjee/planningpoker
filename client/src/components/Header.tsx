import React from 'react';
import { DHLLogo } from './DHLLogo';
import { Users } from 'lucide-react';

interface HeaderProps {
  roomName?: string;
  participantCount?: number;
}

export const Header: React.FC<HeaderProps> = ({ roomName, participantCount }) => {
  return (
    <header className="dhl-header shadow-lg">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <DHLLogo size="md" />
          
          {roomName && (
            <div className="flex items-center space-x-4">
              <div className="hidden sm:block text-white">
                <span className="text-sm opacity-80">Session:</span>
                <span className="ml-2 font-semibold">{roomName}</span>
              </div>
              
              {participantCount !== undefined && (
                <div className="flex items-center space-x-1 bg-white/20 rounded-full px-3 py-1">
                  <Users className="w-4 h-4 text-dhl-yellow" />
                  <span className="text-white text-sm font-medium">
                    {participantCount}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
