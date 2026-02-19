const socket = io();
const roomId = "12345";

const pc = new RTCPeerConnection({
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
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
    console.log("Received stream");
  
    const video = document.getElementById("remoteVideo");
    video.srcObject = event.streams[0];
  
    video.play().catch(err => {
      console.log("Autoplay blocked:", err);
    });
};

pc.onicecandidate = (event) => {
  if (event.candidate) {
    socket.emit("ice-candidate", { roomId, candidate: event.candidate });
  }
};
