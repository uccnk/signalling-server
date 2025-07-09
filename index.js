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

  // socket.on("join", (roomId) => {
  //   socket.join(roomId);
  //   socket.to(roomId).emit("user-joined", socket.id);
  // });

  socket.on("join", (roomId) => {
    socket.join(roomId);

    const clientsInRoom = Array.from(
      io.sockets.adapter.rooms.get(roomId) || []
    );
    const otherClients = clientsInRoom.filter((id) => id !== socket.id);

    // Inform the new user of others in the room
    socket.emit("room-users", otherClients);

    // Notify others that a new user joined
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

socket.on("leave", (roomId) => {
  socket.leave(roomId);
  socket.to(roomId).emit("user-left", socket.id);
});

const PORT = process.env.PORT || 5001;
server.listen(PORT, () =>
  console.log(`Signaling server running on port ${PORT}`)
);
