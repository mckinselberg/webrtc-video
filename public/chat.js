let socket = io.connect('http://localhost:4622');

let message = document.getElementById('message');
let button = document.getElementById('send');
let username = document.getElementById('username');
let output = document.getElementById('output');

button.addEventListener('click', (e) => {
  socket.emit('sendingMessage',  {
    message: message.value,
    username: username.value,
  });
});


socket.on('broadcastMessage', (data) => {
  console.log(data);
  output.innerHTML += `<p><strong>${data.username}</strong>: ${data.message}</p>`
})