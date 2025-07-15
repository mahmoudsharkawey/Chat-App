import { Request, Response } from "express";
import prisma from "../../prisma/client";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

export const verifyOtp = async (req: Request, res: Response) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ message: "Email and OTP are required" });
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !user.otp || !user.otpExpiresAt) {
      return res.status(404).json({ message: "User or OTP not found" });
    }

    // ⛔ OTP منتهي؟
    if (new Date() > user.otpExpiresAt) {
      return res.status(400).json({ message: "OTP expired" });
    }

    // ⛔ تعدى المحاولات المسموحة؟
    if (user.otpAttempts >= 5) {
      return res.status(429).json({ message: "Too many attempts. Please request a new OTP." });
    }

    // ⛔ OTP غلط؟
    if (user.otp !== otp) {
      await prisma.user.update({
        where: { email },
        data: { otpAttempts: { increment: 1 } },
      });
      return res.status(401).json({ message: "Invalid OTP" });
    }

  // ✅ الكود صح → احذف OTP واصفر العداد واعمل توكن
    await prisma.user.update({
      where: { email },
      data: {
        otp: null,
        otpExpiresAt: null,
        otpAttempts: 0,
      },
    });

    // ✅ أنشئ JWT Token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET!,
      { expiresIn: "7d" }
    );
    res.status(200).json({
      message: "Login successful",
      token,
    });
  } catch (error) {
    console.error("OTP Verification error:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};
