// eslint-disable-next-line no-undef
const socket = io.connect('http://localhost:4623');
const divVideoChatLobby = document.getElementById('video-chat-lobby');
const joinButton = document.getElementById('join');
const userVideo = document.getElementById('user-video');
const peerVideo = document.getElementById('peer-video');
const roomInput = document.getElementById('room-name');
let roomName;
let creator = false;
let rtcPeerConnection;
let userStream;

// stun servers
const iceServers = {
  iceServers: [
    { urls: 'stun:stun.services.mozilla.com' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ],
};

const OnIceCandidateFunction = (event) => {
  if (event.candidate) {
    socket.emit('candidate', event.candidate, roomName);
  }
};

const OnTrackFunction = (event) => {
  // eslint-disable-next-line prefer-destructuring
  peerVideo.srcObject = event.streams[0];
  peerVideo.onloadedmetadata = () => {
    peerVideo.play();
  };
};

const connectUserVideo = () => {
  const vidConstraints = {
    audio: true,
    video: {
      width: 1280,
      height: 720,
    },
  };
  navigator.mediaDevices
    .getUserMedia(vidConstraints)
    .then(
      (stream) => {
        // console.log(stream);
        userStream = stream;
        userVideo.srcObject = stream;
        userVideo.onloadedmetadata = (e) => {
          // console.log(e);
          userVideo.play();
        };
        divVideoChatLobby.style = 'display:none';
        if (!creator) {
          socket.emit('ready', roomName);
        }
      },
    ).catch(
      (err) => {
        console.error(`The following error occurred: ${err}`);
      },
    );
};

joinButton.addEventListener('click', () => {
  if (roomInput.value === '') {
    alert('Please enter a room name');
  } else {
    roomName = roomInput.value;
    socket.emit('join', roomName);
  }
});

socket.on('created', () => {
  creator = true;
  // console.log(creator);
  connectUserVideo();
});

socket.on('joined', () => {
  creator = false;
  // console.log(creator);
  connectUserVideo();
});

socket.on('full', () => {
  alert('Room is full. Can\'t join.');
});

socket.on('ready', () => {
  if (creator) {
    rtcPeerConnection = new RTCPeerConnection(iceServers);
    rtcPeerConnection.onicecandidate = OnIceCandidateFunction;
    rtcPeerConnection.ontrack = OnTrackFunction;
    rtcPeerConnection.addTrack(userStream.getTracks()[0], userStream); // audio
    rtcPeerConnection.addTrack(userStream.getTracks()[1], userStream); // video
    rtcPeerConnection
      .createOffer()
      .then((offer) => {
        rtcPeerConnection.setLocalDescription(offer);
        socket.emit('offer', offer, roomName);
      })
      .catch((error) => {
        console.error(error);
      });
  }
});

socket.on('candidate', (candidate) => {
  console.log(candidate);
  const icecandidate = new RTCIceCandidate(candidate);
  rtcPeerConnection.addIceCandidate(icecandidate);
});

// Triggered on receiving an offer from the person who created the room.
socket.on('offer', (offer) => {
  if (!creator) {
    rtcPeerConnection = new RTCPeerConnection(iceServers);
    rtcPeerConnection.onicecandidate = OnIceCandidateFunction;
    rtcPeerConnection.ontrack = OnTrackFunction;
    rtcPeerConnection.addTrack(userStream.getTracks()[0], userStream); // audio
    rtcPeerConnection.addTrack(userStream.getTracks()[1], userStream); // video
    rtcPeerConnection.setRemoteDescription(offer);
    rtcPeerConnection
      .createAnswer()
      .then((answer) => {
        rtcPeerConnection.setLocalDescription(answer);
        socket.emit('answer', answer, roomName);
      })
      .catch((error) => {
        console.error(error);
      });
  }
});
socket.on('answer', (answer) => {
  rtcPeerConnection.setRemoteDescription(answer);
});
