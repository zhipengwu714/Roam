import { Router } from "express";

const router = Router();

// POST /api/decide — AI recommender (dev 5 will build this out)
router.post("/decide", (req, res) => {
  res.json({ message: "decide endpoint coming soon" });
});

export default router;