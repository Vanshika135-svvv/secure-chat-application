const path = require("path");
const mongoose = require("mongoose");
const http = require("http");
const express = require("express");
const socketio = require("socket.io");
const formatMessage = require("./utils/messages");
const { encrypt, decrypt } = require("./utils/cryptography.js");
const Cryptr = require("cryptr");
const Room = require("./RoomSchema");
const bcrypt = require("bcrypt");
const bodyParser = require("body-parser");

// ✅ Strong Encryption
const cryptr = new Cryptr(
  "56dce7276d2b0a24e032beedf0473d743dbacf92aafe898e5a0f8d9898c9eae80a73798beed53489e8dbfd94191c1f28dc58cad12321d8150b93a2e092a744265fd214d7c2ef079e2f01b6d06319b7b2"
);

// ✅ DB CONNECTION — FIXED ✅
mongoose
  .connect("mongodb://127.0.0.1:27017/chat_db", {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ DB Error:", err));

const { userJoin, getCurrentUser, userLeave, getRoomUsers } = require("./utils/users");

const app = express();
const server = http.createServer(app);
const io = socketio(server);

app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const botName = "Admin";


// ✅ SOCKET IO
io.on("connection", (socket) => {
  socket.on("joinRoom", ({ username, room }) => {
    const user = userJoin(socket.id, username, room);
    socket.join(user.room);

    // ✅ Welcome
    socket.emit(
      "message",
      formatMessage(botName, cryptr.encrypt("Welcome To Chatbox"))
    );

    // ✅ Broadcast to others
    socket.broadcast
      .to(user.room)
      .emit(
        "message",
        formatMessage(
          botName,
          cryptr.encrypt(`${user.username} has entered the chat room`)
        )
      );

    // ✅ Room user update
    io.to(user.room).emit("roomUsers", {
      room: user.room,
      users: getRoomUsers(user.room),
    });
  });

  // ✅ Chat Message
  socket.on("chatMessage", (msg) => {
    const user = getCurrentUser(socket.id);
    if (!user) return;

    io.to(user.room).emit("message", formatMessage(user.username, msg));
  });

  // ✅ User leaves
  socket.on("disconnect", () => {
    const user = userLeave(socket.id);

    if (user) {
      io.to(user.room).emit(
        "message",
        formatMessage(
          botName,
          cryptr.encrypt(`${user.username} has left the chat`)
        )
      );

      io.to(user.room).emit("roomUsers", {
        room: user.room,
        users: getRoomUsers(user.room),
      });
    }
  });
});


// ✅ API — DECRYPT
app.get("/decrypt", (req, res) => {
  const message = req.query.message;
  try {
    const decrypted = cryptr.decrypt(message);
    res.json(decrypted);
  } catch (e) {
    res.status(400).json({ error: "Invalid encrypted message" });
  }
});

// ✅ API — ENCRYPT
app.get("/encrypt", (req, res) => {
  const message = req.query.message;
  try {
    const encrypted = cryptr.encrypt(message);
    res.json(encrypted);
  } catch (e) {
    res.status(400).json({ error: "Encryption failed" });
  }
});


// ✅ FIXED — Validate Room & Password
app.post("/validate", async (req, res) => {
  const username = req.body.username;
  const roomName = req.body.room;
  const key = req.body.key;

  try {
    const room = await Room.findOne({ name: roomName });

    // ✅ No Room → STOP
    if (!room) {
      return res.redirect("wrong-password.html");
    }

    // ✅ Validate Key
    const match = await bcrypt.compare(key, room.secretKey);

    // ❌ Invalid password
    if (!match) {
      return res.redirect("wrong-password.html");
    }

    // ✅ Build Redirect URL
    const rn = room.name;
    const usern = username;
    const url = `chat.html?room=${rn}&username=${usern}&sk=${room._id}`;

    console.log("Redirected:", url);

    // ✅ FIX — RETURN
    return res.redirect(url);

  } catch (err) {
    console.warn("Error validating:", err);
    return res.redirect("wrong-password.html");
  }
});


// ✅ SERVER LISTEN
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
