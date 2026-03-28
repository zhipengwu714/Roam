import { useRef, useState } from 'react';

const SWIPE_THRESHOLD = 100;

export default function SwipeCard({ place, onSwipe, active }) {
  const cardRef = useRef(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const startPos = useRef({ x: 0, y: 0 });

  const handlePointerDown = (e) => {
    if (!active) return;
    setDragging(true);
    startPos.current = { x: e.clientX, y: e.clientY };
    cardRef.current?.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e) => {
    if (!dragging) return;
    const dx = e.clientX - startPos.current.x;
    const dy = e.clientY - startPos.current.y;
    setOffset({ x: dx, y: dy });
  };

  const handlePointerUp = () => {
    if (!dragging) return;
    setDragging(false);

    if (Math.abs(offset.x) > SWIPE_THRESHOLD) {
      const direction = offset.x > 0 ? 'right' : 'left';
      // Animate off screen
      const flyX = offset.x > 0 ? 600 : -600;
      setOffset({ x: flyX, y: offset.y });
      setTimeout(() => onSwipe(direction), 200);
    } else {
      setOffset({ x: 0, y: 0 });
    }
  };

  const rotation = offset.x * 0.08;
  const opacity = Math.min(Math.abs(offset.x) / SWIPE_THRESHOLD, 1);

  return (
    <div
      ref={cardRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      className="absolute inset-0 touch-none select-none"
      style={{
        transform: `translateX(${offset.x}px) translateY(${offset.y * 0.3}px) rotate(${rotation}deg)`,
        transition: dragging ? 'none' : 'transform 0.3s ease',
        zIndex: active ? 10 : 5,
      }}
    >
      <div className="w-full h-full bg-gray-800 rounded-2xl border border-gray-700 p-6 flex flex-col justify-between relative overflow-hidden">
        {/* Swipe indicators */}
        {offset.x > 20 && (
          <div
            className="absolute top-6 left-6 text-green-400 text-2xl font-bold border-2 border-green-400 rounded-lg px-3 py-1 -rotate-12"
            style={{ opacity }}
          >
            VOTE
          </div>
        )}
        {offset.x < -20 && (
          <div
            className="absolute top-6 right-6 text-red-400 text-2xl font-bold border-2 border-red-400 rounded-lg px-3 py-1 rotate-12"
            style={{ opacity }}
          >
            PASS
          </div>
        )}

        <div className="mt-16">
          <span className="text-xs uppercase tracking-wider text-blue-400 bg-blue-400/10 px-2 py-1 rounded">
            {place.category}
          </span>
          <h2 className="text-2xl font-bold mt-3 mb-2">{place.name}</h2>
          <p className="text-gray-400">{place.address}</p>
        </div>

        <div className="text-gray-500 text-sm text-center">
          Swipe right to vote, left to pass
        </div>
      </div>
    </div>
  );
}
