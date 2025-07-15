import rateLimit from "express-rate-limit";

export const otpRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // ⏱️ 15 دقيقة
  max: 5,                   // ⛔ 5 محاولات فقط
  message: {
    message: "Too many OTP verification attempts. Please try again later.",
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false,
});


export const sendOtpRateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // ⏱️ 1 دقيقة
  max: 3, // ⛔ 3 مرات بس في الدقيقة من نفس IP
  message: {
    message: "Too many OTP requests. Please wait a minute.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});
