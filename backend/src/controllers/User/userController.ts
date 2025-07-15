import { Request, Response } from "express";
import prisma from "../../prisma/client";

export const searchUsers = async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  const search = req.query.search as string;

  if (!search) return res.json([]);

  try {
    const users = await prisma.user.findMany({
      where: {
        AND: [
          {
            OR: [
              { email: { contains: search, mode: "insensitive" } },
              { name: { contains: search, mode: "insensitive" } }
            ]
          },
          { id: { not: userId } } // عشان ميجبش نفسك
        ]
      },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true
      }
    });

    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to search users" });
  }
};
