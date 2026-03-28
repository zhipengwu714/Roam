// In-memory session store — replace with DB later if needed
// Shape: { [code]: { users: Set, scores: { [placeId]: number } } }
const sessions = {};

export function registerSessionSocket(io, socket) {
  // --- JOIN ---
  socket.on("session:join", ({ code, userId }) => {
    if (!sessions[code]) {
      return socket.emit("session:error", { message: "Session not found" });
    }

    socket.join(code);
    sessions[code].users.add(userId);

    console.log(`[session:join] ${userId} joined ${code}`);

    // Let everyone in the room know someone joined
    io.to(code).emit("session:update", {
      scores: formatScores(sessions[code].scores),
      users: sessions[code].users.size,
    });
  });

  // --- VOTE ---
  socket.on("session:vote", ({ code, placeId, direction }) => {
    if (!sessions[code]) {
      return socket.emit("session:error", { message: "Session not found" });
    }

    if (direction === "right") {
      sessions[code].scores[placeId] =
        (sessions[code].scores[placeId] || 0) + 1;
    }

    console.log(`[session:vote] ${placeId} → ${direction} in ${code}`);

    // Broadcast updated scores to everyone in the room
    io.to(code).emit("session:update", {
      scores: formatScores(sessions[code].scores),
    });
  });

  // --- DECIDE (host triggers this to lock in a winner) ---
  socket.on("session:decide", ({ code }) => {
    if (!sessions[code]) {
      return socket.emit("session:error", { message: "Session not found" });
    }

    const scores = sessions[code].scores;
    const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);

    if (sorted.length === 0) {
      return socket.emit("session:error", { message: "No votes yet" });
    }

    const topScore = sorted[0][1];
    const tied = sorted.filter(([, v]) => v === topScore);

    if (tied.length > 1) {
      // Tie — send all tied places, client shows roulette wheel
      io.to(code).emit("session:decide", {
        roulette: true,
        candidates: tied.map(([placeId]) => placeId),
      });
    } else {
      io.to(code).emit("session:decide", {
        roulette: false,
        winner: sorted[0][0],
      });
    }
  });
}

// Called from session REST route when a session is created
export function createSession(code) {
  sessions[code] = { users: new Set(), scores: {} };
}

export function sessionExists(code) {
  return !!sessions[code];
}

// Converts scores map to sorted array for the leaderboard
function formatScores(scores) {
  return Object.entries(scores)
    .map(([placeId, count]) => ({ placeId, count }))
    .sort((a, b) => b.count - a.count);
}