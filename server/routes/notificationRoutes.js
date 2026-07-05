import express from "express";
import {
  getMyNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
} from "../controllers/notificationController.js";

import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/my", authMiddleware, getMyNotifications);

router.put("/read/:id", authMiddleware, markNotificationRead);

router.put("/read-all", authMiddleware, markAllNotificationsRead);

router.delete("/:id", authMiddleware, deleteNotification);

export default router;