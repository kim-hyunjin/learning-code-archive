// DOM elements
const localVideo = document.getElementById('localVideo');
const remoteVideo = document.getElementById('remoteVideo');
const roomIdInput = document.getElementById('roomId');
const createBtn = document.getElementById('createBtn');
const joinBtn = document.getElementById('joinBtn');
const leaveBtn = document.getElementById('leaveBtn');
const muteBtn = document.getElementById('muteBtn');
const videoBtn = document.getElementById('videoBtn');
const statusDiv = document.getElementById('status');
const messagesDiv = document.getElementById('messages');
const messageInput = document.getElementById('messageInput');
const sendBtn = document.getElementById('sendBtn');

// WebRTC configuration
const configuration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' }
  ]
};

// Global variables
let socket;
let localStream;
let peerConnection;
let dataChannel;
let currentRoom = null;
let isAudioMuted = false;
let isVideoOff = false;

// Initialize the application
async function init() {
  try {
    // Connect to signaling server
    socket = io();
    
    // Set up socket event listeners
    setupSocketListeners();
    
    // Set up UI event listeners
    setupUIListeners();
    
    // Get local media stream
    localStream = await navigator.mediaDevices.getUserMedia({ 
      audio: true, 
      video: true 
    });
    
    // Display local video
    localVideo.srcObject = localStream;
    
    // Enable UI controls
    createBtn.disabled = false;
    joinBtn.disabled = false;
    
    updateStatus('Ready to connect');
  } catch (error) {
    console.error('Error initializing:', error);
    updateStatus(`Error: ${error.message}`);
  }
}

// Set up socket event listeners
function setupSocketListeners() {
  // Room events
  socket.on('room-created', handleRoomCreated);
  socket.on('room-joined', handleRoomJoined);
  socket.on('user-joined', handleUserJoined);
  socket.on('user-left', handleUserLeft);
  
  // WebRTC signaling events
  socket.on('offer', handleOffer);
  socket.on('answer', handleAnswer);
  socket.on('ice-candidate', handleIceCandidate);
  
  // Error events
  socket.on('error', (message) => {
    console.error('Server error:', message);
    updateStatus(`Error: ${message}`);
  });
  
  // Connection events
  socket.on('connect', () => {
    console.log('Connected to signaling server');
  });
  
  socket.on('disconnect', () => {
    console.log('Disconnected from signaling server');
    updateStatus('Disconnected from server');
    handleLeaveRoom();
  });
}

// Set up UI event listeners
function setupUIListeners() {
  createBtn.addEventListener('click', handleCreateRoom);
  joinBtn.addEventListener('click', handleJoinRoom);
  leaveBtn.addEventListener('click', handleLeaveRoom);
  muteBtn.addEventListener('click', toggleMute);
  videoBtn.addEventListener('click', toggleVideo);
  sendBtn.addEventListener('click', sendMessage);
  
  messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  });
}

// Create a new room
function handleCreateRoom() {
  const roomId = roomIdInput.value.trim() || generateRoomId();
  roomIdInput.value = roomId;
  
  socket.emit('create-room', roomId);
  updateStatus('Creating room...');
}

// Join an existing room
function handleJoinRoom() {
  const roomId = roomIdInput.value.trim();
  
  if (!roomId) {
    updateStatus('Please enter a room ID');
    return;
  }
  
  socket.emit('join-room', roomId);
  updateStatus('Joining room...');
}

// Handle room created event
function handleRoomCreated(roomId) {
  currentRoom = roomId;
  updateStatus(`Room created: ${roomId}`);
  
  // Update UI
  createBtn.disabled = true;
  joinBtn.disabled = true;
  leaveBtn.disabled = false;
  
  // No need to create peer connection yet, wait for another user to join
}

// Handle room joined event
function handleRoomJoined(roomId) {
  currentRoom = roomId;
  updateStatus(`Joined room: ${roomId}`);
  
  // Update UI
  createBtn.disabled = true;
  joinBtn.disabled = true;
  leaveBtn.disabled = false;
  
  // Create peer connection and send offer
  createPeerConnection();
  createDataChannel();
  createAndSendOffer();
}

// Handle user joined event
function handleUserJoined(userId) {
  updateStatus('Another user joined the room');
  
  // Create peer connection if not already created
  if (!peerConnection) {
    createPeerConnection();
  }
}

// Handle user left event
function handleUserLeft(userId) {
  updateStatus('The other user left the room');
  
  // Close peer connection
  closePeerConnection();
  
  // Clear remote video
  remoteVideo.srcObject = null;
  
  // Disable send button
  sendBtn.disabled = true;
}

// Leave the current room
function handleLeaveRoom() {
  if (currentRoom) {
    socket.emit('leave-room', currentRoom);
    
    // Close peer connection
    closePeerConnection();
    
    // Clear remote video
    remoteVideo.srcObject = null;
    
    // Update UI
    createBtn.disabled = false;
    joinBtn.disabled = false;
    leaveBtn.disabled = true;
    sendBtn.disabled = true;
    
    currentRoom = null;
    updateStatus('Left the room');
  }
}

// Create a WebRTC peer connection
function createPeerConnection() {
  // Close any existing connection
  closePeerConnection();
  
  // Create a new connection
  peerConnection = new RTCPeerConnection(configuration);
  
  // Add local stream tracks to the connection
  localStream.getTracks().forEach(track => {
    peerConnection.addTrack(track, localStream);
  });
  
  // Set up event handlers
  peerConnection.onicecandidate = (event) => {
    if (event.candidate) {
      socket.emit('ice-candidate', {
        target: getOtherParticipantId(),
        candidate: event.candidate
      });
    }
  };
  
  peerConnection.ontrack = (event) => {
    if (event.streams && event.streams[0]) {
      remoteVideo.srcObject = event.streams[0];
    }
  };
  
  peerConnection.ondatachannel = (event) => {
    dataChannel = event.channel;
    setupDataChannel();
  };
  
  console.log('Peer connection created');
}

// Create a data channel for chat
function createDataChannel() {
  if (peerConnection) {
    dataChannel = peerConnection.createDataChannel('chat');
    setupDataChannel();
    console.log('Data channel created');
  }
}

// Set up data channel event handlers
function setupDataChannel() {
  if (!dataChannel) return;
  
  dataChannel.onopen = () => {
    console.log('Data channel opened');
    sendBtn.disabled = false;
    messageInput.disabled = false;
  };
  
  dataChannel.onclose = () => {
    console.log('Data channel closed');
    sendBtn.disabled = true;
    messageInput.disabled = true;
  };
  
  dataChannel.onmessage = (event) => {
    const message = event.data;
    addMessageToChat('Peer', message);
  };
}

// Create and send an offer
async function createAndSendOffer() {
  if (!peerConnection) return;
  
  try {
    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);
    
    socket.emit('offer', {
      target: getOtherParticipantId(),
      offer: offer
    });
    
    console.log('Offer sent');
  } catch (error) {
    console.error('Error creating offer:', error);
  }
}

// Handle an incoming offer
async function handleOffer(data) {
  if (!peerConnection) {
    createPeerConnection();
  }
  
  try {
    await peerConnection.setRemoteDescription(new RTCSessionDescription(data.offer));
    
    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);
    
    socket.emit('answer', {
      target: data.source,
      answer: answer
    });
    
    console.log('Answer sent');
  } catch (error) {
    console.error('Error handling offer:', error);
  }
}

// Handle an incoming answer
async function handleAnswer(data) {
  try {
    await peerConnection.setRemoteDescription(new RTCSessionDescription(data.answer));
    console.log('Answer received and set');
  } catch (error) {
    console.error('Error handling answer:', error);
  }
}

// Handle an incoming ICE candidate
async function handleIceCandidate(data) {
  try {
    await peerConnection.addIceCandidate(new RTCIceCandidate(data.candidate));
    console.log('ICE candidate added');
  } catch (error) {
    console.error('Error handling ICE candidate:', error);
  }
}

// Close the peer connection
function closePeerConnection() {
  if (dataChannel) {
    dataChannel.close();
    dataChannel = null;
  }
  
  if (peerConnection) {
    peerConnection.close();
    peerConnection = null;
  }
}

// Toggle audio mute
function toggleMute() {
  if (localStream) {
    const audioTracks = localStream.getAudioTracks();
    
    if (audioTracks.length > 0) {
      isAudioMuted = !isAudioMuted;
      audioTracks[0].enabled = !isAudioMuted;
      muteBtn.textContent = isAudioMuted ? 'Unmute' : 'Mute';
    }
  }
}

// Toggle video on/off
function toggleVideo() {
  if (localStream) {
    const videoTracks = localStream.getVideoTracks();
    
    if (videoTracks.length > 0) {
      isVideoOff = !isVideoOff;
      videoTracks[0].enabled = !isVideoOff;
      videoBtn.textContent = isVideoOff ? 'Video On' : 'Video Off';
    }
  }
}

// Send a chat message
function sendMessage() {
  const message = messageInput.value.trim();
  
  if (message && dataChannel && dataChannel.readyState === 'open') {
    dataChannel.send(message);
    addMessageToChat('You', message);
    messageInput.value = '';
  }
}

// Add a message to the chat display
function addMessageToChat(sender, message) {
  const messageElement = document.createElement('div');
  messageElement.textContent = `${sender}: ${message}`;
  messagesDiv.appendChild(messageElement);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

// Update the status display
function updateStatus(message) {
  statusDiv.textContent = message;
}

// Generate a random room ID
function generateRoomId() {
  return Math.random().toString(36).substring(2, 10);
}

// Helper function to get the other participant's ID
function getOtherParticipantId() {
  // This is a simplification. In a real app, you would get this from the server.
  return Array.from(socket.adapter?.rooms?.get(currentRoom) || [])
    .find(id => id !== socket.id);
}

// Initialize the application when the page loads
window.addEventListener('load', init);