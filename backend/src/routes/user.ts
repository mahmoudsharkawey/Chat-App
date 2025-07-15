import express from "express";
import { protect } from "../middleware/authMiddleware";
import { searchUsers } from "../controllers/User/userController";

declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

const router = express.Router();

router.get("/", protect, searchUsers); // GET /api/users?search=


export default router;

