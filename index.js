const express = require('express');
const socket = require('socket.io');

const port = 4623;

const app = express();

const server = app.listen(port, () => {
  console.log('listen');
});

app.use(express.static('public'));

const io = socket(server);

io.on('connection', (socket) => {
  console.log('Websocket Connected', socket.id);
  socket.on('join', (roomName) => {
    // console.log(`roomname: ${roomName}`);

    const { rooms } = io.sockets.adapter;
    console.log('rooms: ', rooms);
    const room = rooms.get(roomName);

    if (room === undefined) {
      socket.join(roomName);
      socket.emit('created');
      // console.log('Room created and joined', roomName);
    } else if (room.size === 1) {
      socket.join(roomName);
      socket.emit('joined');
      // console.log('Room joined', roomName);
    } else {
      socket.emit('full');
      // console.log('Room is full');
    }
  });

  socket.on('ready', (roomName) => {
    console.log('Ready');
    socket.broadcast.to(roomName).emit('ready');
  });

  socket.on('candidate', (candidate, roomName) => {
    console.log('Candidate');
    socket.broadcast.to(roomName).emit('candidate', candidate);
  });

  socket.on('offer', (offer, roomName) => {
    console.log('Offer');
    socket.broadcast.to(roomName).emit('offer', offer);
  });

  socket.on('answer', (answer, roomName) => {
    console.log('Answer');
    socket.broadcast.to(roomName).emit('answer', answer);
  });
});
