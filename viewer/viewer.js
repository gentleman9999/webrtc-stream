const socket = io();
const roomId = "12345";

const pc = new RTCPeerConnection({
  iceServers: [
    {
      urls: [
        "turn:107.150.62.234:3478?transport=udp",
        "turn:107.150.62.234:3478?transport=tcp",
        "turn:107.150.62.234:443?transport=tcp"
      ],
      username: "demo",
      credential: "strongpassword123"
    }
  ]
});

socket.emit("join-room", { roomId, role: "viewer" });

socket.on("offer", async (offer) => {
  console.log("Received offer");

  await pc.setRemoteDescription(offer);

  const answer = await pc.createAnswer();
  await pc.setLocalDescription(answer);

  socket.emit("answer", { roomId, answer });
});

socket.on("ice-candidate", async (candidate) => {
  await pc.addIceCandidate(candidate);
});

pc.ontrack = (event) => {
  const video = document.getElementById("remoteVideo");

  video.srcObject = event.streams[0];
  video.playsInline = true;

  // DO NOT mute now
  video.muted = false;

  video.play().catch(err => {
    console.log("Autoplay prevented:", err);
  });
};

pc.onicecandidate = (event) => {
  if (event.candidate) {
    socket.emit("ice-candidate", { roomId, candidate: event.candidate });
  }
};

pc.oniceconnectionstatechange = () => {
  console.log("ICE state:", pc.iceConnectionState);
};

pc.ontrack = (event) => {
  const video = document.getElementById("remoteVideo");

  video.srcObject = event.streams[0];
  video.playsInline = true;

  // DO NOT mute now
  video.muted = false;

  video.play().catch(err => {
    console.log("Autoplay prevented:", err);
  });
};
