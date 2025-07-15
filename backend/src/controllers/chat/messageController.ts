import { Request, Response } from "express";
import prisma from "../../prisma/client";

export const sendMessage = async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  const { chatId, content } = req.body;

  if (!chatId || !content) {
    return res.status(400).json({ message: "chatId and content are required" });
  }

  try {
    // ✨ خزّن الرسالة في قاعدة البيانات
    const message = await prisma.message.create({
      data: {
        content,
        chat: { connect: { id: chatId } },
        sender: { connect: { id: userId } },
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            avatar: true,
            email: true,
          },
        },
      },
    });
    
    await prisma.chat.update({
      where: { id: chatId },
      data: {
        latestMessage: {
          connect: { id: message.id },
        },
      },
    });

    // 📢 ابعت الرسالة بالسوكت لكل الموجودين في نفس الشات
    const io = req.app.get("io");
    io.to(chatId).emit("receive_message", message);

    res.status(201).json({ message });
  } catch (error) {
    console.error("❌ Failed to send message:", error);
    res.status(500).json({ message: "Failed to send message" });
  }
};

// Get messages for a specific chat
export const getMessages = async (req: Request, res: Response) => {
  const { chatId } = req.params;

  try {
    const messages = await prisma.message.findMany({
      where: { chatId },
      include: {
        sender: {
          select: { id: true, name: true, avatar: true },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    res.status(200).json({ messages });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to get messages" });
  }
};
