const socket = io();

let mediaRecorder;
let sessionId;

// UI elements
const startBtn = document.getElementById('startBtn');
const statusDiv = document.getElementById('status');
const interimDiv = document.getElementById('interimTranscript');
const finalDiv = document.getElementById('finalTranscript');
const audioPlayer = document.getElementById('audioPlayer');

startBtn.onclick = async () => {
  // Start the interview on the backend
  socket.emit('startInterview', { techStack: 'Node.js, TypeScript', position: 'Backend Engineer' });
  statusDiv.textContent = 'Starting interview...';
};

socket.on('interviewStarted', (id) => {
  sessionId = id;
  statusDiv.textContent = `Interview started: Session ${sessionId}`;
});

socket.on('firstQuestion', (question) => {
  finalDiv.textContent = question;
  statusDiv.textContent = 'AI asked a question';
});

socket.on('interimTranscript', (text) => {
  interimDiv.textContent = text;
});

socket.on('transcript', (text) => {
  finalDiv.textContent += '\n' + text;
  interimDiv.textContent = '';
});

// When TTS audio is generated, play it
socket.on('audioGenerated', ({ filename }) => {
  audioPlayer.src = filename;
  audioPlayer.play();
});

// On audio finished (TTS done), start capturing mic and streaming
socket.on('audioFinished', () => {
  startMicStreaming();
  statusDiv.textContent = 'Listening for your answer...';
});

socket.on('interviewComplete', (message) => {
  statusDiv.textContent = `Interview complete: ${message}`;
  stopMicStreaming();
});

// Stream mic audio chunks via MediaRecorder
async function startMicStreaming() {
  if (!navigator.mediaDevices) {
    alert('Media Devices API not supported.');
    return;
  }

  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm; codecs=opus' });

  mediaRecorder.ondataavailable = (e) => {
    if (e.data.size > 0 && sessionId) {
      // Read blob as ArrayBuffer and send to backend
      const reader = new FileReader();
      reader.onload = () => {
        socket.emit('audioChunk', { sessionId, chunk: reader.result });
      };
      reader.readAsArrayBuffer(e.data);
    }
  };

  mediaRecorder.start(250); // Send data every 250ms
}

function stopMicStreaming() {
  if (mediaRecorder && mediaRecorder.state !== 'inactive') {
    mediaRecorder.stop();
  }
  statusDiv.textContent = 'Microphone stopped.';
}

socket.on('error', (err) => {
  statusDiv.textContent = `Error: ${err}`;
});
