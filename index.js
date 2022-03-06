const express = require("express");
const socket = require("socket.io");
const app = express();

let server = app.listen(4000, function () {
  console.log("server is running");
});

// app.use(express.static("public"));

let io = socket(server, {
  cors: {
    origin: "http://localhost:3000",
    credentials: true,
  },
});

io.on("connection", function (socket) {
  console.log("user connected: ", socket.id);

  socket.on("join", function (roomName) {
    let rooms = io.sockets.adapter.rooms; // get a map of id's of socket connected to a server.
    let room = rooms.get(roomName);

    if (room == undefined) {
      socket.join([roomName, socket.id]);
      console.log("room created: ", roomName, " ", socket.id);
      socket.emit("created", socket.id);
    } else if (room.size < 10) {
      socket.join([roomName, socket.id]);
      console.log("join to room: ", roomName, " ", socket.id);
      socket.emit("joined", socket.id);
    } else {
      console.log("room is full: ", roomName);
      socket.emit("full");
    }
    console.log(rooms);
  });

  socket.on("ready", function (roomName, id) {
    // ready is an event that triggred by client when he join to room
    console.log("Ready", id);
    socket.broadcast.to(roomName).emit("ready", id);
  });

  socket.on("candidate", function (candidate, roomName, id, to) {
    console.log("candidate: ", id, " ", to);

    // information about ip address of internet connection of user.
    socket.broadcast.to(to).emit("candidate", candidate, id);
  });

  socket.on("offer", function (offer, roomName, id, to) {
    console.log("offer: ", id, " ", to);
    // information about encoding of call or is call is audio or video etc.
    socket.broadcast.to(to).emit("offer", offer, id);
  });

  socket.on("answer", function (answer, roomName, id, to) {
    console.log("answer", id, " ", to);

    // after getting an answer communication is started.
    socket.broadcast.to(to).emit("answer", answer, id);
  });

  socket.on("leave", function (roomName) {
    console.log("leave the room");
    socket.leave(roomName); // to remove a socket id from room.

    socket.broadcast.to(roomName).emit("leave");
  });
});
