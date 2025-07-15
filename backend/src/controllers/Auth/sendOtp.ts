import { Request, Response } from "express";
import prisma from "../../prisma/client";
import { Resend } from "resend";
import crypto from "crypto";
import dotenv from "dotenv";
dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendOtp = async (req: Request, res: Response) => {
  const { email } = req.body;

  if (!email) return res.status(400).json({ message: "Email is required" });

  // توليد OTP (رقم عشوائي من 6 أرقام)
  const otp = crypto.randomInt(100000, 999999).toString();
  const otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000); // ⏱️ بعد 5 دقائق

  try {
    // تحقق هل المستخدم موجود؟
    let user = await prisma.user.findUnique({ where: { email } });

    if (user) {
      // تحديث OTP
      await prisma.user.update({
        where: { email },
        data: { otp, otpExpiresAt, otpAttempts: 0 },
      });
    } else {
      // إنشاء مستخدم جديد
      await prisma.user.create({
        data: { email, otp, otpExpiresAt, otpAttempts: 0 },
      });
    }

    
    if (user && user.otpExpiresAt && new Date() < user.otpExpiresAt) {
      return res
        .status(429)
        .json({ message: "You can request a new OTP after 1 minute." });
    }

    // إرسال OTP بالإيميل
    const result = await resend.emails.send({
      from: "chat-app <onboarding@resend.dev>",
      to: [email],
      subject: "Your OTP Code",
      html: `
  <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto; padding: 24px; border: 1px solid #eaeaea; border-radius: 8px; background-color: #f9f9f9;">
    <h2 style="color: #333;">👋 Welcome to Chat App!</h2>
    <p style="font-size: 16px; color: #555;">Your one-time password (OTP) is:</p>
    <p style="font-size: 28px; font-weight: bold; color: #1a73e8; letter-spacing: 2px; margin: 16px 0;">
      ${otp}
    </p>
    <p style="font-size: 14px; color: #999;">This code will expire in 5 minutes. Please don’t share it with anyone.</p>
    <hr style="margin: 24px 0;" />
    <p style="font-size: 12px; color: #aaa;">If you didn't request this, just ignore this email.</p>
  </div>
`,
    });
    console.log("✅ OTP email sent (maybe):", result);

    res.status(200).json({ message: "OTP sent successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};
