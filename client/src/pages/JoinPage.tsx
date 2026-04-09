import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { Users } from 'lucide-react';

const API_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3001';

export const JoinPage: React.FC = () => {
  const navigate = useNavigate();
  const { roomId } = useParams<{ roomId: string }>();
  const [userName, setUserName] = useState('');
  const [roomInfo, setRoomInfo] = useState<{
    exists: boolean;
    roomName?: string;
    participantCount?: number;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isJoining, setIsJoining] = useState(false);

  useEffect(() => {
    const checkRoom = async () => {
      if (!roomId) return;

      try {
        const response = await fetch(`${API_URL}/api/rooms/${roomId}`);
        const data = await response.json();
        setRoomInfo(data);

        if (!data.exists) {
          toast({
            title: 'Room Not Found',
            description: 'This planning poker session does not exist or has ended.',
            variant: 'destructive',
          });
        }
      } catch (error) {
        console.error('Error checking room:', error);
        toast({
          title: 'Error',
          description: 'Failed to connect to server. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    // Check if user already has a name stored
    const storedName = sessionStorage.getItem('userName');
    if (storedName) {
      setUserName(storedName);
    }

    checkRoom();
  }, [roomId]);

  const handleJoinRoom = async () => {
    if (!userName.trim()) {
      toast({
        title: 'Name Required',
        description: 'Please enter your name to join the session.',
        variant: 'destructive',
      });
      return;
    }

    setIsJoining(true);

    // Store user info in session storage
    sessionStorage.setItem('userName', userName.trim());
    sessionStorage.setItem('isHost', 'false');

    navigate(`/room/${roomId}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <Header />
        <div className="flex items-center justify-center h-[60vh]">
          <div className="spinner" />
        </div>
      </div>
    );
  }

  if (!roomInfo?.exists) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <Header />
        <div className="container mx-auto px-4 py-12">
          <Card className="max-w-md mx-auto border-2 border-dhl-red">
            <CardHeader>
              <CardTitle className="text-center text-dhl-red">
                Session Not Found
              </CardTitle>
              <CardDescription className="text-center">
                This planning poker session does not exist or has ended.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => navigate('/')}
                className="w-full"
                variant="secondary"
              >
                Create a New Session
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Header />
      
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto">
          <Card className="border-2 border-dhl-yellow shadow-xl">
            <CardHeader className="bg-gradient-to-r from-dhl-red to-dhl-darkRed text-white rounded-t-lg">
              <CardTitle className="text-2xl">Join Session</CardTitle>
              <CardDescription className="text-white/80">
                {roomInfo.roomName}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              {/* Room Info */}
              <div className="bg-dhl-yellow/10 rounded-lg p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Currently in session</p>
                  <p className="font-semibold text-gray-900">
                    {roomInfo.participantCount || 0} participant(s)
                  </p>
                </div>
                <Users className="w-8 h-8 text-dhl-red" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Your Name *
                </label>
                <Input
                  placeholder="Enter your name"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleJoinRoom()}
                  className="border-gray-300 focus:border-dhl-yellow"
                  autoFocus
                />
              </div>

              <Button
                onClick={handleJoinRoom}
                disabled={isJoining}
                className="w-full h-12 text-lg"
                size="lg"
              >
                {isJoining ? (
                  <span className="flex items-center">
                    <div className="spinner mr-2" />
                    Joining...
                  </span>
                ) : (
                  'Join Session'
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default JoinPage;
