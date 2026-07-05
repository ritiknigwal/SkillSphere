import express from "express";
import {
  sendExchangeRequest,
  getMyExchangeRequests,
  acceptExchangeRequest,
  rejectExchangeRequest,
  cancelExchangeRequest,
  completeExchangeRequest,
} from "../controllers/exchangeController.js";

import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/send", authMiddleware, sendExchangeRequest);

router.get("/my", authMiddleware, getMyExchangeRequests);

router.put("/accept/:id", authMiddleware, acceptExchangeRequest);

router.put("/reject/:id", authMiddleware, rejectExchangeRequest);

router.put("/cancel/:id", authMiddleware, cancelExchangeRequest);

router.put("/complete/:id", authMiddleware, completeExchangeRequest);

export default router;