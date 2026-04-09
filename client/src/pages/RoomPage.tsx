import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSocket } from '@/context/SocketContext';
import { Header } from '@/components/Header';
import { VoteCard } from '@/components/VoteCard';
import { ParticipantCard } from '@/components/ParticipantCard';
import { VotingResults } from '@/components/VotingResults';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';
import { Copy, Eye, RotateCcw, Share2, LogOut, Check } from 'lucide-react';

interface Participant {
  id: string;
  name: string;
  vote: string | null;
  isHost?: boolean;
}

const VOTE_OPTIONS = ['0', '1', '2', '3', '5', '8', '13', '21', '34', '55', '89', '?', '☕'];

export const RoomPage: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const { socket, isConnected } = useSocket();
  
  const [roomName, setRoomName] = useState('Planning Poker Session');
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [selectedVote, setSelectedVote] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string>('');
  const [isHost, setIsHost] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [copied, setCopied] = useState(false);

  const userName = sessionStorage.getItem('userName');
  const userIsHost = sessionStorage.getItem('isHost') === 'true';

  // Redirect if no username
  useEffect(() => {
    if (!userName) {
      navigate(`/join/${roomId}`);
    }
  }, [userName, roomId, navigate]);

  // Join room when socket connects
  useEffect(() => {
    if (socket && isConnected && userName && roomId) {
      socket.emit('join-room', {
        roomId,
        userName,
        isHost: userIsHost,
      });

      setCurrentUserId(socket.id || '');
      setIsHost(userIsHost);
    }
  }, [socket, isConnected, userName, roomId, userIsHost]);

  // Socket event handlers
  useEffect(() => {
    if (!socket) return;

    socket.on('room-state', (data) => {
      setRoomName(data.roomName);
      setParticipants(data.participants);
      setRevealed(data.revealed);
      setCurrentUserId(socket.id || '');
      
      // Find current user's vote
      const currentUser = data.participants.find(
        (p: Participant) => p.id === socket.id
      );
      if (currentUser?.vote) {
        setSelectedVote(currentUser.vote);
      }
    });

    socket.on('participant-joined', (data) => {
      setParticipants(data.participants);
      toast({
        title: 'New Participant',
        description: `${data.participant.name} joined the session`,
      });
    });

    socket.on('participant-left', (data) => {
      setParticipants(data.participants);
      toast({
        title: 'Participant Left',
        description: `${data.participantName} left the session`,
      });
    });

    socket.on('vote-updated', (data) => {
      setParticipants(data.participants);
    });

    socket.on('votes-revealed', (data) => {
      setParticipants(data.participants);
      setRevealed(true);
    });

    socket.on('votes-reset', (data) => {
      setParticipants(data.participants);
      setRevealed(false);
      setSelectedVote(null);
    });

    socket.on('error', (data) => {
      toast({
        title: 'Error',
        description: data.message,
        variant: 'destructive',
      });
      navigate('/');
    });

    return () => {
      socket.off('room-state');
      socket.off('participant-joined');
      socket.off('participant-left');
      socket.off('vote-updated');
      socket.off('votes-revealed');
      socket.off('votes-reset');
      socket.off('error');
    };
  }, [socket, navigate]);

  const handleVote = useCallback(
    (vote: string) => {
      if (revealed) return;
      
      setSelectedVote(vote);
      socket?.emit('submit-vote', { roomId, vote });
    },
    [socket, roomId, revealed]
  );

  const handleReveal = useCallback(() => {
    socket?.emit('reveal-votes', { roomId });
  }, [socket, roomId]);

  const handleReset = useCallback(() => {
    socket?.emit('reset-votes', { roomId });
  }, [socket, roomId]);

  const handleCopyLink = useCallback(() => {
    const shareUrl = `${window.location.origin}/join/${roomId}`;
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({
      title: 'Link Copied!',
      description: 'Share this link with your team members',
      variant: 'default',
    });
  }, [roomId]);

  const handleLeave = useCallback(() => {
    sessionStorage.removeItem('userName');
    sessionStorage.removeItem('isHost');
    navigate('/');
  }, [navigate]);

  const votedCount = participants.filter((p) => p.vote !== null).length;
  const totalCount = participants.length;
  const allVoted = votedCount === totalCount && totalCount > 0;

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <Header />
        <div className="flex flex-col items-center justify-center h-[60vh]">
          <div className="spinner mb-4" />
          <p className="text-gray-600">Connecting to server...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Header roomName={roomName} participantCount={participants.length} />

      <main className="container mx-auto px-4 py-6">
        {/* Action Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              onClick={() => setShowShareDialog(true)}
              className="flex items-center gap-2"
            >
              <Share2 className="w-4 h-4" />
              Invite Team
            </Button>
            <Button
              variant="outline"
              onClick={handleLeave}
              className="flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Leave
            </Button>
          </div>

          <div className="flex items-center gap-2">
            {!revealed ? (
              <Button
                onClick={handleReveal}
                disabled={votedCount === 0}
                className="flex items-center gap-2"
              >
                <Eye className="w-4 h-4" />
                Reveal Votes ({votedCount}/{totalCount})
              </Button>
            ) : (
              <Button
                onClick={handleReset}
                variant="secondary"
                className="flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                New Round
              </Button>
            )}
          </div>
        </div>

        {/* Voting Status Banner */}
        {!revealed && (
          <div
            className={`mb-6 p-4 rounded-xl text-center ${
              allVoted
                ? 'bg-green-100 text-green-800 border border-green-200'
                : 'bg-dhl-yellow/20 text-gray-700 border border-dhl-yellow'
            }`}
          >
            {allVoted ? (
              <span className="font-semibold">
                ✅ All participants have voted! Ready to reveal.
              </span>
            ) : (
              <span>
                Waiting for votes... <strong>{votedCount}</strong> of{' '}
                <strong>{totalCount}</strong> voted
              </span>
            )}
          </div>
        )}

        {/* Participants Grid */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">
            Participants
          </h2>
          <div className="flex flex-wrap justify-center gap-4">
            {participants.map((participant) => (
              <ParticipantCard
                key={participant.id}
                participant={participant}
                revealed={revealed}
                isCurrentUser={participant.id === currentUserId}
              />
            ))}
          </div>
        </div>

        {/* Voting Results (after reveal) */}
        <VotingResults participants={participants} revealed={revealed} />

        {/* Vote Cards */}
        {!revealed && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mt-8">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">
              Cast Your Vote
            </h2>
            <div className="vote-cards-grid justify-items-center">
              {VOTE_OPTIONS.map((value) => (
                <VoteCard
                  key={value}
                  value={value}
                  selected={selectedVote === value}
                  onClick={() => handleVote(value)}
                />
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Share Dialog */}
      <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite Your Team</DialogTitle>
            <DialogDescription>
              Share this link with your team members to join the session
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-2">
            <Input
              readOnly
              value={`${window.location.origin}/join/${roomId}`}
              className="flex-1"
            />
            <Button onClick={handleCopyLink} variant="secondary">
              {copied ? (
                <Check className="w-4 h-4" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RoomPage;
