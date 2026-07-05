import express from "express";
import {
  sendMessage,
  getMessages,
  markDelivered,
  markSeen,
  markMessagesAsSeen,
  updateMessage,
  deleteMessage,
  reactToMessage,
  clearChat,
} from "../controllers/messageController.js";

import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/send", authMiddleware, sendMessage);

router.get("/:id", authMiddleware, getMessages);

router.put("/delivered/:messageId", authMiddleware, markDelivered);

router.put("/seen/:messageId", authMiddleware, markSeen);

router.put("/seen-all/:senderId", authMiddleware, markMessagesAsSeen);

router.put("/react/:id", authMiddleware, reactToMessage);

router.put("/:id", authMiddleware, updateMessage);

router.delete("/:id", authMiddleware, deleteMessage);

router.delete("/clear/:userId",authMiddleware,clearChat);

export default router;