const sessions = new Map();

function generateCode() {
  const num = Math.floor(1000 + Math.random() * 9000);
  return `ROAM-${num}`;
}

export function createSession(hostSocketId, places) {
  let code;
  do {
    code = generateCode();
  } while (sessions.has(code));

  const session = {
    code,
    hostSocketId,
    users: [],
    places,
    votes: {},
    timerDuration: null,
    timerStartedAt: null,
    phase: 'lobby',
    timerId: null,
  };

  // Initialize votes for each place
  for (const place of places) {
    session.votes[place.id] = 0;
  }

  sessions.set(code, session);
  return session;
}

export function getSession(code) {
  return sessions.get(code) || null;
}

export function addUser(code, socketId, nickname) {
  const session = sessions.get(code);
  if (!session) return null;
  session.users.push({ socketId, nickname });
  return session;
}

export function removeUser(socketId) {
  for (const [code, session] of sessions) {
    const idx = session.users.findIndex((u) => u.socketId === socketId);
    if (idx !== -1) {
      session.users.splice(idx, 1);
      return { code, session, wasHost: session.hostSocketId === socketId };
    }
  }
  return null;
}

export function recordVote(code, placeId) {
  const session = sessions.get(code);
  if (!session || session.phase !== 'voting') return null;
  if (placeId in session.votes) {
    session.votes[placeId]++;
  }
  return session;
}

export function startTimer(code, duration) {
  const session = sessions.get(code);
  if (!session) return null;
  session.timerDuration = duration;
  session.timerStartedAt = Date.now();
  session.phase = 'voting';
  return session;
}

export function getWinner(code) {
  const session = sessions.get(code);
  if (!session) return null;
  session.phase = 'results';

  const entries = Object.entries(session.votes);
  if (entries.length === 0) return null;

  entries.sort((a, b) => b[1] - a[1]);
  const [winnerId] = entries[0];
  const winner = session.places.find((p) => p.id === winnerId);
  return { winner, votes: session.votes };
}

export function deleteSession(code) {
  const session = sessions.get(code);
  if (session?.timerId) clearTimeout(session.timerId);
  sessions.delete(code);
}

export function findSessionBySocket(socketId) {
  for (const [code, session] of sessions) {
    if (session.users.some((u) => u.socketId === socketId)) {
      return { code, session };
    }
  }
  return null;
}
