const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use("/publisher", express.static(path.join(__dirname, "publisher")));
app.use("/viewer", express.static(path.join(__dirname, "viewer")));

const rooms = {};

io.on("connection", (socket) => {

  socket.on("join-room", ({ roomId, role }) => {
    socket.join(roomId);

    if (!rooms[roomId]) {
      rooms[roomId] = { publisher: null, viewers: [] };
    }

    if (role === "publisher") {
      rooms[roomId].publisher = socket.id;
      console.log("Publisher joined:", roomId);
    }

    if (role === "viewer") {
      rooms[roomId].viewers.push(socket.id);
      console.log("Viewer joined:", roomId);

      // Notify publisher a viewer is ready
      if (rooms[roomId].publisher) {
        io.to(rooms[roomId].publisher).emit("viewer-ready");
      }
    }
  });

  socket.on("offer", ({ roomId, offer }) => {
    socket.to(roomId).emit("offer", offer);
  });

  socket.on("answer", ({ roomId, answer }) => {
    socket.to(roomId).emit("answer", answer);
  });

  socket.on("ice-candidate", ({ roomId, candidate }) => {
    socket.to(roomId).emit("ice-candidate", candidate);
  });

});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});