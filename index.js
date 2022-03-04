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
      socket.join(roomName);
      console.log("room created: ", roomName);
      socket.emit("created");
    } else if (room.size < 3) {
      socket.join(roomName);
      console.log("join to room: ", roomName);
      socket.emit("joined");
    } else {
      console.log("room is full: ", roomName);
      socket.emit("full");
    }
    console.log(rooms);
  });

  socket.on("ready", function (roomName) {
    // ready is an event that triggred by client when he join to room
    console.log("Ready");
    socket.broadcast.to(roomName).emit("ready");
  });

  socket.on("candidate", function (candidate, roomName) {
    console.log("candidate: ", candidate);

    // information about ip address of internet connection of user.
    socket.broadcast.to(roomName).emit("candidate", candidate);
  });

  socket.on("offer", function (offer, roomName) {
    console.log("offer: ", offer);
    // information about encoding of call or is call is audio or video etc.
    socket.broadcast.to(roomName).emit("offer", offer);
  });

  socket.on("answer", function (answer, roomName) {
    console.log("answer");

    // after getting an answer communication is started.
    socket.broadcast.to(roomName).emit("answer", answer);
  });

  socket.on("leave", function (roomName) {
    console.log("leave the room");
    socket.leave(roomName); // to remove a socket id from room.

    socket.broadcast.to(roomName).emit("leave");
  });
});
