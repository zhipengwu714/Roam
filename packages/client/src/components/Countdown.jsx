import { useState, useEffect } from 'react';

export default function Countdown({ duration, startedAt }) {
  const [remaining, setRemaining] = useState(duration);

  useEffect(() => {
    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startedAt) / 1000);
      const left = Math.max(0, duration - elapsed);
      setRemaining(left);
    }, 1000);
    return () => clearInterval(interval);
  }, [duration, startedAt]);

  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;
  const isUrgent = remaining <= 10;

  return (
    <div
      className={`text-center font-mono text-3xl font-bold ${
        isUrgent ? 'text-red-400' : 'text-white'
      }`}
    >
      {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
    </div>
  );
}
