import { Router } from "express";
import { createSession, sessionExists } from "../sockets/sessionSocket.js";

const router = Router();

function generateCode() {
  const num = Math.floor(1000 + Math.random() * 9000);
  return `ROAM-${num}`;
}

router.post("/create", (req, res) => {
  let code = generateCode();
  while (sessionExists(code)) code = generateCode();
  createSession(code);
  console.log(`[session] created: ${code}`);
  res.json({ code });
});

router.post("/join", (req, res) => {
  const { code } = req.body;
  if (!code || !sessionExists(code)) {
    return res.status(404).json({ error: "Session not found" });
  }
  res.json({ ok: true, code });
});

export default router;