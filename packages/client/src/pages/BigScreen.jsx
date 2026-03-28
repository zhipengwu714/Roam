import { useState, useCallback, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getSocket, useSocketEvent } from '../hooks/useSocket';
import { getSession } from '../lib/api';
import Leaderboard from '../components/Leaderboard';
import Countdown from '../components/Countdown';

export default function BigScreen() {
  const { code } = useParams();
  const navigate = useNavigate();
  const [places, setPlaces] = useState([]);
  const [votes, setVotes] = useState({});
  const [timer, setTimer] = useState(null);
  const [winner, setWinner] = useState(null);

  // Fetch session data and join room on mount
  useEffect(() => {
    (async () => {
      try {
        const session = await getSession(code);
        setPlaces(session.places);
        setVotes(session.votes);
        if (session.timerStartedAt) {
          setTimer({ duration: session.timerDuration, startedAt: session.timerStartedAt });
        }
      } catch (e) {
        console.error('Failed to load session', e);
      }
    })();

    const socket = getSocket();
    socket.emit('session:join', { code, nickname: 'BigScreen' });
  }, [code]);

  useSocketEvent(
    'session:timerStarted',
    useCallback(({ duration, startedAt }) => {
      setTimer({ duration, startedAt });
    }, [])
  );

  useSocketEvent(
    'session:votesUpdated',
    useCallback(({ votes }) => setVotes(votes), [])
  );

  useSocketEvent(
    'session:results',
    useCallback(({ winner, votes }) => {
      setVotes(votes);
      setWinner(winner);
    }, [])
  );

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Roam</h1>
            <p className="text-gray-400 font-mono">{code}</p>
          </div>
          {timer && (
            <Countdown duration={timer.duration} startedAt={timer.startedAt} />
          )}
        </div>

        {winner ? (
          <div className="text-center py-12">
            <p className="text-gray-400 text-sm uppercase tracking-wider mb-2">Winner</p>
            <h2 className="text-4xl font-bold mb-2">{winner.name}</h2>
            <p className="text-gray-400 text-lg mb-8">{winner.category} — {winner.address}</p>
            <div className="max-w-md mx-auto">
              <Leaderboard votes={votes} places={places} />
            </div>
          </div>
        ) : (
          <>
            <h2 className="text-xl font-semibold mb-4">
              {timer ? 'Live Votes' : 'Waiting for voting to start...'}
            </h2>
            <Leaderboard votes={votes} places={places} />
          </>
        )}
      </div>
    </div>
  );
}
