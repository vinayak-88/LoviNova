require("dotenv").config();
const express = require("express");
const { connectDB } = require("./config/database");
const app = express();
const cookieParser = require("cookie-parser");
const authRouter = require("./routes/auth");
const profileRouter = require("./routes/profile");
const requestRouter = require("./routes/request");
const userRouter = require("./routes/user");
const chatRouter = require("./routes/chat");
const cors = require("cors");
// const transporter = require("./config/email");

// app.set("trust proxy", 1);

app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);

app.use(authRouter);
app.use(profileRouter);
app.use(requestRouter);
app.use(userRouter);
app.use(chatRouter);

//global error handling middleware
app.use((err, req, res, next) => {
  // If it's a mongoose validation error
  if (err.name === "ValidationError") {
    const errors = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({ errors });
  }

  // For other errors
  res.status(500).json({ message: err.message || "Something went wrong" });
});

const path = require("path");

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../../Frontend/dist")));

  app.use((req, res) => {
    res.sendFile(path.join(__dirname, "../../Frontend/dist/index.html"));
  });
}

const http = require("http");
const { Server } = require("socket.io");
const conversation = require("./models/conversation");
const message = require("./models/message");

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL,
    credentials: true,
  },
});

let onlineUsers = new Map();

io.on("connection", (socket) => {
  socket.on("userOnline", (userId) => {
    onlineUsers.set(userId, socket.id);
  });

  socket.on("sendMessage", ({ senderId, receiverId, message }) => {
    const receiverSocket = onlineUsers.get(receiverId);
    const senderSocket = onlineUsers.get(senderId);
    if (receiverSocket) {
      io.to(receiverSocket).emit("receiveMessage", { senderId, message });
    }
    if (senderSocket) {
      io.to(senderSocket).emit("receiveMessage", { senderId, message });
    }
  });

  socket.on("messageRead", async ({ conversationId, receiverId }) => {
    await message.updateMany(
      { conversationId, senderId: { $ne: receiverId }, read: false },
      { $set: { read: true } }
    );

    const chat = await conversation.findById(conversationId);
    if (!chat) return;

    const otherUserId = chat.participants.find(
      (id) => id.toString() !== receiverId
    );
    const otherUserSocket = onlineUsers.get(otherUserId.toString());

    if (otherUserSocket) {
      io.to(otherUserSocket).emit("messageRead", { conversationId });
    }
  });

  socket.on("disconnect", () => {
    onlineUsers.forEach((value, key) => {
      if (value === socket.id) onlineUsers.delete(key);
    });
  });
});

const PORT = process.env.PORT;
connectDB()
  .then(() => {
    server.listen(PORT, () => {});
  })
  .catch((err) => {});
