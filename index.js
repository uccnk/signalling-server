const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" },
});

io.on("connection", (socket) => {
  console.log("New socket connected:", socket.id);

  socket.on("join", (roomId) => {
    socket.join(roomId);
    socket.to(roomId).emit("user-joined", socket.id);
  });

  socket.on("offer", (data) => {
    socket.to(data.target).emit("offer", { sdp: data.sdp, caller: socket.id });
  });

  socket.on("answer", (data) => {
    socket.to(data.target).emit("answer", { sdp: data.sdp });
  });

  socket.on("ice-candidate", (data) => {
    socket.to(data.target).emit("ice-candidate", { candidate: data.candidate });
  });

  socket.on("disconnect", () => {
    console.log("Socket disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 5001;
server.listen(PORT, () =>
  console.log(`Signaling server running on port ${PORT}`)
);
