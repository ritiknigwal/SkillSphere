import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";

import authRoutes from "./routes/authRoutes.js";
import skillRoutes from "./routes/skillRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import exchangeRoutes from "./routes/exchangeRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import sessionRoutes from "./routes/sessionRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import availabilityRoutes from "./routes/availabilityRoutes.js";
import connectionRoutes from "./routes/connectionRoutes.js";
import emailVerificationRoutes from "./routes/emailVerificationRoutes.js";
import passwordResetRoutes from "./routes/passwordResetRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";

dotenv.config();
console.log("EMAIL_USER:", process.env.EMAIL_USER);
console.log("EMAIL_PASS EXISTS:", !!process.env.EMAIL_PASS);

const app = express();

app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

app.use("/uploads", express.static("uploads"));

app.use("/api/auth", authRoutes);
app.use("/api/skills", skillRoutes);
app.use("/api/user", userRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/exchanges", exchangeRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/sessions", sessionRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/availability", availabilityRoutes);
app.use("/api/connections", connectionRoutes);
app.use("/api/email-verification", emailVerificationRoutes);
app.use("/api/password-reset", passwordResetRoutes);
app.use("/api/admin", adminRoutes);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log("MongoDB error:", err));

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
  },
});

const onlineUsers = new Map();

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("join_room", (userId) => {
    socket.join(userId);
    onlineUsers.set(userId, socket.id);
    io.emit("online_users", Array.from(onlineUsers.keys()));
  });

  socket.on("send_message", (data) => {
    const receiverId = data.receiverId || data.receiver;

    io.to(receiverId).emit("receive_message", data);
  });

  socket.on("edit_message", (updatedMessage) => {
    const receiverId = updatedMessage.receiver;
    const senderId = updatedMessage.sender;

    io.to(receiverId).emit("edit_message", updatedMessage);
    io.to(senderId).emit("edit_message", updatedMessage);
  });

  socket.on("delete_message", (data) => {
    io.to(data.receiverId).emit("delete_message", data);
    io.to(data.senderId).emit("delete_message", data);
  });

  socket.on("react_message", (updatedMessage) => {
    const receiverId = updatedMessage.receiver;
    const senderId = updatedMessage.sender;

    io.to(receiverId).emit("react_message", updatedMessage);
    io.to(senderId).emit("react_message", updatedMessage);
  });

  socket.on("typing", (data) => {
    socket.to(data.receiverId).emit("typing", {
      senderId: data.senderId,
    });
  });

  socket.on("stop_typing", (data) => {
    socket.to(data.receiverId).emit("stop_typing", {
      senderId: data.senderId,
    });
  });

  // ==========================
  // VIDEO CALL SOCKET EVENTS
  // ==========================

  socket.on("video_call_user", (data) => {
    io.to(data.receiverId).emit("video_incoming_call", {
      callerId: data.callerId,
      callerName: data.callerName,
      offer: data.offer,
    });
  });

  socket.on("video_answer_call", (data) => {
    io.to(data.callerId).emit("video_call_answered", {
      answer: data.answer,
      receiverId: data.receiverId,
    });
  });

  socket.on("video_reject_call", (data) => {
    io.to(data.callerId).emit("video_call_rejected", {
      receiverId: data.receiverId,
    });
  });

  socket.on("video_end_call", (data) => {
    io.to(data.targetUserId).emit("video_call_ended", {
      endedBy: data.endedBy,
    });
  });

  socket.on("video_ice_candidate", (data) => {
    io.to(data.targetUserId).emit("video_ice_candidate", {
      candidate: data.candidate,
    });
  });

  socket.on("video_toggle_camera", (data) => {
    io.to(data.targetUserId).emit("video_remote_camera_toggle", {
      isCameraOn: data.isCameraOn,
    });
  });

  socket.on("video_toggle_mic", (data) => {
    io.to(data.targetUserId).emit("video_remote_mic_toggle", {
      isMicOn: data.isMicOn,
    });
  });

  socket.on("video_screen_share_started", (data) => {
    io.to(data.targetUserId).emit("video_remote_screen_share_started");
  });

  socket.on("video_screen_share_stopped", (data) => {
    io.to(data.targetUserId).emit("video_remote_screen_share_stopped");
  });

  socket.on("disconnect", () => {
    for (let [userId, socketId] of onlineUsers.entries()) {
      if (socketId === socket.id) {
        onlineUsers.delete(userId);
        break;
      }
    }

    io.emit("online_users", Array.from(onlineUsers.keys()));
    console.log("User disconnected:", socket.id);
  });
});

app.set("io", io);

const PORT = process.env.PORT || 5050;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});