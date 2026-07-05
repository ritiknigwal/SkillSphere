import express from "express";
import {
  createReview,
  getUserReviews,
  getMyReviews,
  updateReview,
  deleteReview,
} from "../controllers/reviewController.js";

import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", authMiddleware, createReview);

router.get("/my", authMiddleware, getMyReviews);

router.get("/user/:userId", authMiddleware, getUserReviews);

router.put("/:id", authMiddleware, updateReview);

router.delete("/:id", authMiddleware, deleteReview);

export default router;