import express from "express";
import { sendOtp } from "../controllers/Auth/sendOtp";
import { verifyOtp } from "../controllers/Auth/verifyOtp";
import {
  otpRateLimiter,
  sendOtpRateLimiter,
} from "../middleware/otpRateLimiter";

const router = express.Router();

router.post("/send-otp", sendOtpRateLimiter, sendOtp);
router.post("/verify-otp", otpRateLimiter, verifyOtp);

export default router;
