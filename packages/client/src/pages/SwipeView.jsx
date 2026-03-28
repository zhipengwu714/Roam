import { useState, useCallback } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { useSocketEvent, useEmit } from '../hooks/useSocket';
import SwipeDeck from '../components/SwipeDeck';
import Countdown from '../components/Countdown';

export default function SwipeView() {
  const { code } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const emit = useEmit();

  const { nickname, places, duration, startedAt } = location.state || {};
  const [finished, setFinished] = useState(false);

  const handleVote = (placeId) => {
    emit('session:vote', { code, placeId });
  };

  useSocketEvent(
    'session:results',
    useCallback(
      ({ winner, votes }) => {
        navigate(`/results/${code}`, {
          state: { winner, votes, places, nickname },
        });
      },
      [code, navigate, places, nickname]
    )
  );

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center p-6">
      <div className="w-full max-w-sm">
        <div className="mb-6">
          <Countdown duration={duration} startedAt={startedAt} />
          <p className="text-gray-400 text-sm text-center mt-1">
            {finished ? 'Waiting for timer...' : 'Swipe to vote!'}
          </p>
        </div>

        <SwipeDeck
          places={places || []}
          onVote={handleVote}
          onFinished={() => setFinished(true)}
        />
      </div>
    </div>
  );
}
