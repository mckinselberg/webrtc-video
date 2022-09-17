const express = require('express');
const socket = require('socket.io');
const port = 4623;

let app = express();

let server = app.listen(port, () => {
  console.log('listen')
});

app.use(express.static('public'));

let upgradedServer = socket(server);

upgradedServer.on('connection', (socket) => {
  socket.on('sendingMessage', (data) => {
    upgradedServer.emit('broadcastMessage', data);
    console.log(data);
  });
  console.log('Websocket Connected', socket.id)
})