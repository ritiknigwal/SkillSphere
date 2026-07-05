import express from "express";
import {
  sendVerificationOTP,
  verifyEmailOTP,
} from "../controllers/emailVerificationController.js";

const router = express.Router();

router.post("/send-otp", sendVerificationOTP);

router.post("/verify-otp", verifyEmailOTP);

export default router;