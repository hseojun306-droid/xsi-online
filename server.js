const path = require("path");
const http = require("http");
const express = require("express");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;

app.use(express.static(__dirname));

const users = new Map();

io.on("connection", (socket) => {
  users.set(socket.id, "익명");

  socket.emit("system_message", {
    text: "온라인 Xsi 방에 연결됐어요! 친구들과 같은 방에서 대화할 수 있어요. 💜"
  });

  socket.on("set_name", (name) => {
    const safe = String(name || "익명").trim().slice(0, 20) || "익명";
    users.set(socket.id, safe);
    io.emit("system_message", { text: `${safe}님이 들어왔어요! 👋` });
  });

  socket.on("chat_message", (text) => {
    const clean = String(text || "").trim().slice(0, 1000);
    if (!clean) return;

    io.emit("chat_message", {
      id: socket.id,
      name: users.get(socket.id) || "익명",
      text: clean,
      time: new Date().toISOString()
    });
  });

  socket.on("disconnect", () => {
    const name = users.get(socket.id) || "익명";
    users.delete(socket.id);
    io.emit("system_message", { text: `${name}님이 나갔어요.` });
  });
});

server.listen(PORT, () => {
  console.log(`Xsi online server running on port ${PORT}`);
});
