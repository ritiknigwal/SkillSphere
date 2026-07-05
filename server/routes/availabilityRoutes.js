import express from "express";
import {
  createAvailability,
  getMyAvailability,
  getTeacherAvailability,
  deleteAvailability,
} from "../controllers/availabilityController.js";

import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", authMiddleware, createAvailability);

router.get("/my", authMiddleware, getMyAvailability);

router.get("/teacher/:teacherId", authMiddleware, getTeacherAvailability);

router.delete("/:id", authMiddleware, deleteAvailability);

export default router;