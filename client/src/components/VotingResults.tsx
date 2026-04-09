import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Participant {
  id: string;
  name: string;
  vote: string | null;
  isHost?: boolean;
}

interface VotingResultsProps {
  participants: Participant[];
  revealed: boolean;
}

export const VotingResults: React.FC<VotingResultsProps> = ({
  participants,
  revealed,
}) => {
  if (!revealed) return null;

  const votes = participants
    .filter((p) => p.vote !== null)
    .map((p) => p.vote as string);

  if (votes.length === 0) {
    return (
      <Card className="mt-6 border-dhl-yellow">
        <CardHeader>
          <CardTitle className="text-center text-gray-500">
            No votes to show
          </CardTitle>
        </CardHeader>
      </Card>
    );
  }

  // Calculate statistics
  const numericVotes = votes
    .filter((v) => !isNaN(parseFloat(v)))
    .map((v) => parseFloat(v));

  const average =
    numericVotes.length > 0
      ? numericVotes.reduce((a, b) => a + b, 0) / numericVotes.length
      : null;

  // Count vote frequencies
  const voteCount: Record<string, number> = {};
  votes.forEach((vote) => {
    voteCount[vote] = (voteCount[vote] || 0) + 1;
  });

  const sortedVotes = Object.entries(voteCount).sort((a, b) => b[1] - a[1]);
  const maxCount = sortedVotes[0]?.[1] || 0;

  // Check for consensus
  const hasConsensus = sortedVotes.length === 1 || 
    (sortedVotes[0]?.[1] === votes.length);

  return (
    <Card className="mt-6 border-2 border-dhl-yellow bg-gradient-to-br from-white to-dhl-yellow/5">
      <CardHeader className="pb-2">
        <CardTitle className="text-center text-dhl-red flex items-center justify-center gap-2">
          {hasConsensus ? (
            <>
              <span className="text-2xl">🎉</span>
              Consensus Reached!
              <span className="text-2xl">🎉</span>
            </>
          ) : (
            'Voting Results'
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Average */}
        {average !== null && (
          <div className="text-center mb-6">
            <span className="text-sm text-gray-500">Average</span>
            <div className="text-4xl font-bold text-dhl-red">
              {average.toFixed(1)}
            </div>
          </div>
        )}

        {/* Vote Distribution */}
        <div className="space-y-3">
          {sortedVotes.map(([vote, count]) => (
            <div key={vote} className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-dhl-yellow flex items-center justify-center font-bold text-xl text-dhl-red border-2 border-dhl-red">
                {vote}
              </div>
              <div className="flex-1">
                <div
                  className="h-8 rounded-lg bg-gradient-to-r from-dhl-red to-dhl-darkRed flex items-center transition-all duration-700"
                  style={{
                    width: `${(count / maxCount) * 100}%`,
                    minWidth: '40px',
                  }}
                >
                  <span className="text-white text-sm font-medium px-3">
                    {count} vote{count > 1 ? 's' : ''}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Voters List */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="text-sm text-gray-500 mb-2">Voters:</div>
          <div className="flex flex-wrap gap-2">
            {participants
              .filter((p) => p.vote !== null)
              .map((p) => (
                <span
                  key={p.id}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100"
                >
                  <span className="font-medium">{p.name}</span>
                  <span className="ml-2 text-dhl-red font-bold">{p.vote}</span>
                </span>
              ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default VotingResults;
