import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createSession } from '../lib/api';
import { getSocket } from '../hooks/useSocket';
import { useGeolocation } from '../hooks/useGeolocation';

export default function Home() {
  const navigate = useNavigate();
  const [nickname, setNickname] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { requestLocation } = useGeolocation();

  const handleCreate = async () => {
    if (!nickname.trim()) return setError('Enter a nickname');
    setLoading(true);
    setError('');
    try {
      let lat = 40.7128, lng = -74.006; // NYC fallback
      try {
        const loc = await requestLocation();
        lat = loc.lat;
        lng = loc.lng;
      } catch {
        // Use fallback location
      }
      const { code, places } = await createSession(lat, lng);
      const socket = getSocket();
      socket.emit('session:join', { code, nickname: nickname.trim() });
      navigate(`/lobby/${code}`, {
        state: { nickname: nickname.trim(), isHost: true, places },
      });
    } catch (e) {
      setError('Failed to create session');
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = () => {
    if (!nickname.trim()) return setError('Enter a nickname');
    if (!joinCode.trim()) return setError('Enter a session code');
    setError('');
    const code = joinCode.trim().toUpperCase();
    const socket = getSocket();
    socket.emit('session:join', { code, nickname: nickname.trim() });
    navigate(`/lobby/${code}`, {
      state: { nickname: nickname.trim(), isHost: false },
    });
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-6">
      <h1 className="text-5xl font-bold mb-2">Roam</h1>
      <p className="text-gray-400 mb-8">Your city, for free, without the BS.</p>

      {error && <p className="text-red-400 mb-4">{error}</p>}

      <input
        type="text"
        placeholder="Your nickname"
        value={nickname}
        onChange={(e) => setNickname(e.target.value)}
        className="w-72 px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 mb-6 text-center text-lg focus:outline-none focus:border-blue-500"
        maxLength={20}
      />

      <button
        onClick={handleCreate}
        disabled={loading}
        className="w-72 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 font-semibold text-lg mb-8 disabled:opacity-50"
      >
        {loading ? 'Creating...' : 'Create Session'}
      </button>

      <div className="w-72 border-t border-gray-700 pt-6">
        <p className="text-gray-400 text-sm mb-3 text-center">Or join a friend</p>
        <input
          type="text"
          placeholder="ROAM-XXXX"
          value={joinCode}
          onChange={(e) => setJoinCode(e.target.value)}
          className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 mb-3 text-center text-lg tracking-widest uppercase focus:outline-none focus:border-blue-500"
          maxLength={9}
        />
        <button
          onClick={handleJoin}
          className="w-full py-3 rounded-lg bg-gray-700 hover:bg-gray-600 font-semibold text-lg"
        >
          Join Session
        </button>
      </div>
    </div>
  );
}
