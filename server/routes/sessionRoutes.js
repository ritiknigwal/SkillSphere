import express from "express";
import {
  createSession,
  getMySessions,
  acceptSession,
  rejectSession,
  cancelSession,
  completeSession,
} from "../controllers/sessionController.js";

import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/book", authMiddleware, createSession);

router.get("/my", authMiddleware, getMySessions);

router.put("/accept/:id", authMiddleware, acceptSession);

router.put("/reject/:id", authMiddleware, rejectSession);

router.put("/cancel/:id", authMiddleware, cancelSession);

router.put("/complete/:id", authMiddleware, completeSession);

export default router;