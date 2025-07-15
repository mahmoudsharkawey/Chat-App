import express from "express";
import { protect } from "../middleware/authMiddleware";
import {
  createGroupChat,
  createPrivateChat,
  getUserChats,
} from "../controllers/chat/chatController";

const router = express.Router();

router.get("/", protect, getUserChats);
router.post("/private", protect, createPrivateChat);
router.post("/group", protect, createGroupChat);

export default router;
