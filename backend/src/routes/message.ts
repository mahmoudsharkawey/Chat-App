import express from "express";
import { protect } from "../middleware/authMiddleware";
import { getMessages, sendMessage } from "../controllers/chat/messageController";

const router = express.Router();

router.post("/", protect, sendMessage);
router.get("/:chatId", protect, getMessages); 

export default router;
