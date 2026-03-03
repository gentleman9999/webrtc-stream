const socket = io();
const roomId = "12345";

const pc = new RTCPeerConnection({
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    {
      urls: "turn:openrelay.metered.ca:80",
      username: "openrelayproject",
      credential: "openrelayproject"
    },
    {
      urls: "turn:openrelay.metered.ca:443",
      username: "openrelayproject",
      credential: "openrelayproject"
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

  video.muted = true;      // VERY IMPORTANT
  video.playsInline = true;

  const playPromise = video.play();

  if (playPromise !== undefined) {
    playPromise.catch(error => {
      console.log("Autoplay prevented:", error);
    });
  }
};

pc.onicecandidate = (event) => {
  if (event.candidate) {
    socket.emit("ice-candidate", { roomId, candidate: event.candidate });
  }
};

pc.oniceconnectionstatechange = () => {
  console.log("ICE state:", pc.iceConnectionState);
};
