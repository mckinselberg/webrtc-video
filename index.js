const express = require('express');
const socket = require('socket.io');

const port = 4623;

const app = express();

const server = app.listen(port, () => {
  console.log(`listening on port ${port}`);
});

app.use(express.static('public'));

const io = socket(server);

// Triggered when a client is connected.
io.on('connection', (socket) => {
  console.log('User connected', socket.id);
  // Triggered when a peer hits the join room button.
  socket.on('join', (roomName) => {
    const { rooms } = io.sockets.adapter;
    const room = rooms.get(roomName);

    if (room === undefined) {
      socket.join(roomName);
      socket.emit('created');
    } else if (room.size === 1) {
      socket.join(roomName);
      socket.emit('joined');
    } else {
      socket.emit('full');
    }
  });

  socket.on('ready', (roomName) => {
    socket.broadcast.to(roomName).emit('ready');
  });

  // Triggered when server gets an icecandidate from a peer in the room.
  socket.on('candidate', (candidate, roomName) => {
    console.log('candidate: ', candidate);
    socket.broadcast.to(roomName).emit('candidate', candidate);
  });

  // Triggered when server gets an offer from a peer in the room.
  socket.on('offer', (offer, roomName) => {
    // console.log('Offer', offer);
    socket.broadcast.to(roomName).emit('offer', offer);
  });

  socket.on('answer', (answer, roomName) => {
    // console.log('Answer');
    socket.broadcast.to(roomName).emit('answer', answer);
  });
});
