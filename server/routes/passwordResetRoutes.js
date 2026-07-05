import express from "express";
import {
  sendPasswordResetOTP,
  resetPassword,
} from "../controllers/passwordResetController.js";

const router = express.Router();

router.post("/send-otp", sendPasswordResetOTP);

router.post("/reset", resetPassword);

export default router;