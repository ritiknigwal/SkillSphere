import express from "express";
import {
  sendConnectionRequest,
  getMyConnections,
  acceptConnectionRequest,
  rejectConnectionRequest,
  removeConnection,
} from "../controllers/connectionController.js";

import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/send", authMiddleware, sendConnectionRequest);

router.get("/my", authMiddleware, getMyConnections);

router.put("/accept/:id", authMiddleware, acceptConnectionRequest);

router.put("/reject/:id", authMiddleware, rejectConnectionRequest);

router.delete("/:id", authMiddleware, removeConnection);

export default router;