const { io } = require("socket.io-client");

const socket = io("http://localhost:5000");

const CHAT_ID = "18fe7660-6630-4b27-b410-1348ef5b8915"; // ← عدلها لرقم الشات الحقيقي

socket.on("connect", () => {
  console.log("🟢 Connected to socket:", socket.id);

  // Join the same chat room
  socket.emit("join_chat", CHAT_ID);
});

socket.on("receive_message", (message) => {
  console.log("📩 New message received:", message);
});
