const socket = io();
const roomId = "12345";

let currentStream = null;
let currentFacingMode = "environment"; // default back camera

console.log("isSecureContext:", window.isSecureContext);
console.log("mediaDevices:", navigator.mediaDevices);

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

async function startCamera() {
  try {
    const constraints = {
      video: { facingMode: { ideal: currentFacingMode } },
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true
      }
    };

    const newStream = await navigator.mediaDevices.getUserMedia(constraints);

    const newVideoTrack = newStream.getVideoTracks()[0];
    const newAudioTrack = newStream.getAudioTracks()[0];

    const videoSender = pc.getSenders().find(s => s.track && s.track.kind === "video");
    const audioSender = pc.getSenders().find(s => s.track && s.track.kind === "audio");

    if (videoSender) {
      await videoSender.replaceTrack(newVideoTrack);
    } else {
      pc.addTrack(newVideoTrack, newStream);
    }

    if (newAudioTrack) {
      if (audioSender) {
        await audioSender.replaceTrack(newAudioTrack);
      } else {
        pc.addTrack(newAudioTrack, newStream);
      }
    }

    if (currentStream) {
      currentStream.getTracks().forEach(track => track.stop());
    }

    currentStream = newStream;
    document.getElementById("localVideo").srcObject = currentStream;

  } catch (err) {
    console.error("Camera/Mic error:", err);
  }
}

async function init() {
  await startCamera();
  socket.emit("join-room", { roomId, role: "publisher" });
}

socket.on("viewer-ready", async () => {
  console.log("Viewer ready. Creating offer...");

  const offer = await pc.createOffer();
  await pc.setLocalDescription(offer);

  socket.emit("offer", { roomId, offer });
});

socket.on("answer", async (answer) => {
  await pc.setRemoteDescription(answer);
});

socket.on("ice-candidate", async (candidate) => {
  await pc.addIceCandidate(candidate);
});

pc.onicecandidate = (event) => {
  if (event.candidate) {
    socket.emit("ice-candidate", { roomId, candidate: event.candidate });
  }
};

pc.oniceconnectionstatechange = () => {
  console.log("ICE state:", pc.iceConnectionState);
};

// 🔥 Camera Switch Function
document.getElementById("switchCam")?.addEventListener("click", async () => {
  currentFacingMode =
    currentFacingMode === "environment" ? "user" : "environment";

  await startCamera();
});

init();