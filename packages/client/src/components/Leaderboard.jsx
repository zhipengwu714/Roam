export default function Leaderboard({ votes, places }) {
  if (!votes || !places) return null;

  const sorted = Object.entries(votes)
    .map(([id, count]) => {
      const place = places.find((p) => p.id === id);
      return { id, name: place?.name || id, category: place?.category || '', count };
    })
    .sort((a, b) => b.count - a.count);

  const maxVotes = Math.max(...sorted.map((s) => s.count), 1);

  return (
    <div className="space-y-3 w-full">
      {sorted.map((item, i) => (
        <div key={item.id} className="flex items-center gap-3">
          <span className="text-gray-400 font-mono w-6 text-right text-sm">
            {i + 1}
          </span>
          <div className="flex-1">
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium truncate">{item.name}</span>
              <span className="text-sm text-gray-400 ml-2">{item.count}</span>
            </div>
            <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${(item.count / maxVotes) * 100}%` }}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
