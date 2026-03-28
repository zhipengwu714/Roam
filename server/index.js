import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import sessionRoutes from "./routes/session.js";
import decideRoutes from "./routes/decide.js";
import { registerSessionSocket } from "./sockets/sessionSocket.js";

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: "*", // tighten this before prod
    methods: ["GET", "POST"],
  },
});

app.use(cors());
app.use(express.json());

// REST routes
app.use("/api/session", sessionRoutes);
app.use("/api", decideRoutes);

// Health check
app.get("/", (req, res) => res.json({ status: "roam backend alive" }));

// Socket.io
io.on("connection", (socket) => {
  console.log(`[socket] connected: ${socket.id}`);
  registerSessionSocket(io, socket);

  socket.on("disconnect", () => {
    console.log(`[socket] disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`server running on port ${PORT}`);
});