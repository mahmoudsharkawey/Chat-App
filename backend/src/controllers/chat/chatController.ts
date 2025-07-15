import { Request, Response } from "express";
import prisma from "../../prisma/client";


// create private chat

export const createPrivateChat = async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  const { otherUserId } = req.body;

  if (!userId || !otherUserId) {
    return res.status(400).json({ message: "Both users are required" });
  }

  if (userId === otherUserId) {
    return res.status(400).json({ message: "You cannot chat with yourself" });
  }

  try {
    // هل الشات ده موجود؟
    const existingChat = await prisma.chat.findFirst({
      where: {
        isGroup: false,
        users: {
          every: {
            OR: [{ userId: userId }, { userId: otherUserId }],
          },
        },
      },
      include: {
        users: true,
      },
    });

    if (existingChat) {
      return res
        .status(200)
        .json({ chat: existingChat, message: "Chat already exists" });
    }

    // أنشئ الشات
    const chat = await prisma.chat.create({
      data: {
        isGroup: false,
        users: {
          create: [
            { user: { connect: { id: userId } } },
            { user: { connect: { id: otherUserId } } },
          ],
        },
      },
      include: {
        users: true,
      },
    });

    res.status(201).json({ chat, message: "New private chat created" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to create chat" });
  }
};


// create group chat

export const createGroupChat = async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  const { name, description, avatar, userIds } = req.body;

  if (!name || !userIds || userIds.length < 1) {
    return res
      .status(400)
      .json({ message: "Name and at least one member are required" });
  }

  try {
    const chat = await prisma.chat.create({
      data: {
        name,
        description,
        avatar,
        isGroup: true,
        users: {
          create: [
            // Add all members
            ...userIds.map((id: string) => ({
              user: { connect: { id } },
            })),
            // Add creator as well
            {
              user: { connect: { id: userId } },
            },
          ],
        },
      },
      include: {
        users: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
              },
            },
          },
        },
      },
    });

    res.status(201).json({ message: "Group chat created", chat });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};


// Get all chats for a user

export const getUserChats = async (req: Request, res: Response) => {
  const userId = req.user?.userId;

  try {
    const chats = await prisma.chat.findMany({
      where: {
        users: {
          some: {
            userId: userId
          }
        }
      },
      include: {
        users: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true
              }
            }
          }
        },
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1 // آخر رسالة فقط
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    res.json({ chats });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch chats" });
  }
};
