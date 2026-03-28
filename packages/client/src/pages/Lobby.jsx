import { useState, useCallback, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { useSocketEvent, useEmit } from '../hooks/useSocket';
import { getSession } from '../lib/api';

const TIMER_OPTIONS = [
  { label: '1 min', value: 60 },
  { label: '2 min', value: 120 },
  { label: '3 min', value: 180 },
  { label: '5 min', value: 300 },
];

export default function Lobby() {
  const { code } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const emit = useEmit();

  const { nickname, isHost } = location.state || {};
  const [places, setPlaces] = useState(location.state?.places || null);
  const [users, setUsers] = useState([]);
  const [duration, setDuration] = useState(120);

  // Joiners don't have places from navigation state — fetch from API
  useEffect(() => {
    if (!places) {
      getSession(code)
        .then((session) => setPlaces(session.places))
        .catch((e) => console.error('Failed to fetch session:', e));
    }
  }, [code, places]);

  useSocketEvent(
    'session:userJoined',
    useCallback(({ users }) => setUsers(users), [])
  );

  useSocketEvent(
    'session:timerStarted',
    useCallback(
      ({ duration, startedAt }) => {
        navigate(`/swipe/${code}`, {
          state: { nickname, places, duration, startedAt },
        });
      },
      [code, navigate, nickname, places]
    )
  );

  useSocketEvent(
    'session:error',
    useCallback(({ message }) => alert(message), [])
  );

  const handleStart = () => {
    emit('session:startTimer', { code, duration });
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(code).catch(() => {});
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-6">
      <p className="text-gray-400 text-sm mb-2">Session Code</p>
      <h2
        className="text-3xl font-mono font-bold tracking-widest mb-2 cursor-pointer hover:text-blue-400 transition-colors"
        onClick={handleCopyCode}
        title="Click to copy"
      >
        {code}
      </h2>
      <p className="text-gray-500 text-xs mb-8">Tap to copy</p>

      <div className="w-72 mb-8">
        <p className="text-gray-400 text-sm mb-3">
          {users.length} {users.length === 1 ? 'person' : 'people'} in lobby
        </p>
        <div className="space-y-2">
          {users.map((u, i) => (
            <div
              key={i}
              className="px-4 py-2 bg-gray-800 rounded-lg flex items-center"
            >
              <span className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-sm font-bold mr-3">
                {u.nickname[0].toUpperCase()}
              </span>
              {u.nickname}
            </div>
          ))}
        </div>
      </div>

      {isHost && (
        <div className="w-72">
          <label className="text-gray-400 text-sm mb-2 block">Voting Duration</label>
          <select
            value={duration}
            onChange={(e) => setDuration(Number(e.target.value))}
            className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 mb-4 focus:outline-none"
          >
            {TIMER_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <button
            onClick={handleStart}
            className="w-full py-3 rounded-lg bg-green-600 hover:bg-green-700 font-semibold text-lg"
          >
            Start Voting
          </button>
        </div>
      )}

      {!isHost && (
        <p className="text-gray-400">Waiting for the host to start...</p>
      )}
    </div>
  );
}
