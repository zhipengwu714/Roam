import { useState } from 'react';
import SwipeCard from './SwipeCard';

export default function SwipeDeck({ places, onVote, onFinished }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleSwipe = (direction) => {
    if (direction === 'right') {
      onVote(places[currentIndex].id);
    }
    const next = currentIndex + 1;
    if (next >= places.length) {
      onFinished();
    } else {
      setCurrentIndex(next);
    }
  };

  if (currentIndex >= places.length) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400">
        You've seen all places! Waiting for the timer...
      </div>
    );
  }

  return (
    <div className="relative w-full" style={{ height: '400px' }}>
      {/* Render current and next card for depth effect */}
      {places.slice(currentIndex, currentIndex + 2).map((place, i) => (
        <SwipeCard
          key={place.id}
          place={place}
          active={i === 0}
          onSwipe={handleSwipe}
        />
      ))}
    </div>
  );
}
