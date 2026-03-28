import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import 'dotenv/config';
import sessionsRouter from './routes/sessions.js';
import bathroomsRouter from './routes/bathrooms.js';
import { registerSocketHandlers } from './sockets/handler.js';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, { cors: { origin: '*' } });

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/sessions', sessionsRouter);
app.use('/api/bathrooms', bathroomsRouter);

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  registerSocketHandlers(io, socket);
});

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`Roam server running on :${PORT}`);
});
