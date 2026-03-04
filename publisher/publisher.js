const socket = io();
const roomId = "12345";

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

let localStream = null;
let currentFacingMode = "environment"; // default back camera

async function startCamera() {
  try {
    // Stop previous stream if exists
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
    }

    const constraints = {
      video: {
        facingMode: currentFacingMode
      },
      audio: false
    };

    localStream = await navigator.mediaDevices.getUserMedia(constraints);

    const videoElement = document.getElementById("localVideo");
    videoElement.srcObject = localStream;

    // Remove old senders
    pc.getSenders().forEach(sender => {
      pc.removeTrack(sender);
    });

    // Add new tracks
    localStream.getTracks().forEach(track => {
      pc.addTrack(track, localStream);
    });

  } catch (err) {
    console.error("Camera error:", err);
    alert("Camera error: " + err.message);
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