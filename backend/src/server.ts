import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import http from "http";
import { Server } from "socket.io";

import authRoutes from "./routes/auth";
import userRoutes from "./routes/user";
import chatRoutes from "./routes/chat";
import messageRoutes from "./routes/message";

// 🌍 Middlewares and Env
dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

// 📡 Create HTTP server
const server = http.createServer(app);

// 🔌 Setup Socket.IO
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    credentials: true,
  },
});

// 🔁 Store io globally to use inside controllers
app.set("io", io);

// 📞 Handle Socket.IO connection
io.on("connection", (socket) => {
  console.log("🟢 User connected:", socket.id);

  socket.on("join_chat", (chatId: string) => {
    socket.join(chatId);
    console.log(`✅ Socket ${socket.id} joined chat room ${chatId}`);
  });

  socket.on("disconnect", () => {
    console.log("❌ User disconnected:", socket.id);
  });
});

// ✅ Test route
app.get("/", (req, res) => {
  res.send("API is running...");
});

// 🧭 Routes
app.use("/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/chats", chatRoutes);
app.use("/api/messages", messageRoutes);

// 🚀 Start the server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () =>
  console.log(`🚀 Server running on http://localhost:${PORT}`)
);
