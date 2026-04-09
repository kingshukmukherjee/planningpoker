import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { Users, Zap, Share2 } from 'lucide-react';

const API_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3001';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [hostName, setHostName] = useState('');
  const [roomName, setRoomName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateRoom = async () => {
    if (!hostName.trim()) {
      toast({
        title: 'Name Required',
        description: 'Please enter your name to create a session.',
        variant: 'destructive',
      });
      return;
    }

    setIsCreating(true);

    try {
      const response = await fetch(`${API_URL}/api/rooms`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          hostName: hostName.trim(),
          roomName: roomName.trim() || 'Planning Poker Session',
        }),
      });

      const data = await response.json();

      if (data.roomId) {
        // Store user info in session storage
        sessionStorage.setItem('userName', hostName.trim());
        sessionStorage.setItem('isHost', 'true');
        
        navigate(`/room/${data.roomId}`);
      }
    } catch (error) {
      console.error('Error creating room:', error);
      toast({
        title: 'Error',
        description: 'Failed to create session. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Header />
      
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              DHL <span className="text-dhl-red">Planning Poker</span>
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Estimate your sprint stories collaboratively with your team.
              Fast, simple, and effective.
            </p>
          </div>

          {/* Create Session Card */}
          <Card className="max-w-md mx-auto border-2 border-dhl-yellow shadow-xl">
            <CardHeader className="bg-gradient-to-r from-dhl-red to-dhl-darkRed text-white rounded-t-lg">
              <CardTitle className="text-2xl">Start a Session</CardTitle>
              <CardDescription className="text-white/80">
                Create a new planning poker session and invite your team
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Your Name *
                </label>
                <Input
                  placeholder="Enter your name"
                  value={hostName}
                  onChange={(e) => setHostName(e.target.value)}
                  className="border-gray-300 focus:border-dhl-yellow"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Session Name (optional)
                </label>
                <Input
                  placeholder="Sprint Planning - Week 42"
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                  className="border-gray-300 focus:border-dhl-yellow"
                />
              </div>

              <Button
                onClick={handleCreateRoom}
                disabled={isCreating}
                className="w-full h-12 text-lg"
                size="lg"
              >
                {isCreating ? (
                  <span className="flex items-center">
                    <div className="spinner mr-2" />
                    Creating...
                  </span>
                ) : (
                  'Create Session'
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Features Section */}
          <div className="mt-16 grid md:grid-cols-3 gap-6">
            <FeatureCard
              icon={<Users className="w-8 h-8 text-dhl-red" />}
              title="Real-time Collaboration"
              description="See your team members vote in real-time"
            />
            <FeatureCard
              icon={<Zap className="w-8 h-8 text-dhl-red" />}
              title="Instant Results"
              description="Reveal votes simultaneously to avoid bias"
            />
            <FeatureCard
              icon={<Share2 className="w-8 h-8 text-dhl-red" />}
              title="Easy Sharing"
              description="Share a simple link with your team to join"
            />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-6 mt-16">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-gray-400">
            © {new Date().getFullYear()} DHL Planning Poker. Built for agile teams.
          </p>
        </div>
      </footer>
    </div>
  );
};

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description }) => (
  <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100 hover:shadow-lg transition-shadow">
    <div className="mb-4">{icon}</div>
    <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
    <p className="text-gray-600 text-sm">{description}</p>
  </div>
);

export default HomePage;
