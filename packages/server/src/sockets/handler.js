import {
  getSession,
  addUser,
  removeUser,
  recordVote,
  startTimer,
  getWinner,
  findSessionBySocket,
} from '../sessionStore.js';

export function registerSocketHandlers(io, socket) {
  socket.on('session:join', ({ code, nickname }) => {
    const session = getSession(code);
    if (!session) {
      socket.emit('session:error', { message: 'Session not found' });
      return;
    }
    if (session.phase !== 'lobby') {
      socket.emit('session:error', { message: 'Session already in progress' });
      return;
    }

    socket.join(code);
    addUser(code, socket.id, nickname);

    // If this is the first user (host), mark them
    if (session.users.length === 1) {
      session.hostSocketId = socket.id;
    }

    io.to(code).emit('session:userJoined', {
      users: session.users.map((u) => ({ nickname: u.nickname })),
    });
  });

  socket.on('session:startTimer', ({ code, duration }) => {
    const session = getSession(code);
    if (!session) return;
    if (session.hostSocketId !== socket.id) {
      socket.emit('session:error', { message: 'Only the host can start the timer' });
      return;
    }

    startTimer(code, duration);

    const startedAt = session.timerStartedAt;
    io.to(code).emit('session:timerStarted', { duration, startedAt });

    // Schedule times up
    session.timerId = setTimeout(() => {
      const result = getWinner(code);
      io.to(code).emit('session:timesUp', { votes: session.votes });
      if (result) {
        io.to(code).emit('session:results', result);
      }
    }, duration * 1000);
  });

  socket.on('session:vote', ({ code, placeId }) => {
    const session = recordVote(code, placeId);
    if (!session) return;
    io.to(code).emit('session:votesUpdated', { votes: session.votes });
  });

  socket.on('disconnect', () => {
    const result = removeUser(socket.id);
    if (result) {
      const { code, session } = result;
      io.to(code).emit('session:userJoined', {
        users: session.users.map((u) => ({ nickname: u.nickname })),
      });
    }
  });
}
