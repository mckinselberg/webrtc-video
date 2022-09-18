const socket = io.connect('http://localhost:4623');
const divVideoChatLobby = document.getElementById('video-chat-lobby');
// const divVideoChat = document.getElementById('video-chat-room');
const joinButton = document.getElementById('join');
const userVideo = document.getElementById('user-video');
// const peerVideo = document.getElementById('peer-video');
const roomInput = document.getElementById('room-name');

joinButton.addEventListener('click', () => {
  if (roomInput.value === '') {
    alert('Please enter a room name');
  } else {
    socket.emit('join', roomInput.value);
    const constraints = {
      audio: false,
      video: {
        width: 1280,
        height: 720,
      },
    };
    navigator.mediaDevices.getUserMedia(constraints)
      .then(
        (stream) => {
          console.log(stream);
          userVideo.srcObject = stream;
          userVideo.onloadedmetadata = (e) => {
            console.log(e);
            userVideo.play();
          };
          divVideoChatLobby.style = 'display:none';
        },
      ).catch(
        (err) => {
          console.error(`The following error occurred: ${err}`);
        },
      );
  }
});
