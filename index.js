const WebSocket = require('ws');
const uuid = require('uuid');
const SimplePeer = require('simple-peer');

// Create a WebSocket server
const wss = new WebSocket.Server({ port: 3000 });

// Store connected clients
const clients = new Set();

// Store WebRTC peer connections
const peers = new Map();

// Broadcast a message to all connected clients
function broadcast(message) {
  clients.forEach((client) => {
    client.send(message);
  });
}

// Event listener for new connections
wss.on('connection', (ws) => {
  console.log('A new client has connected.');

  // Generate a random ID for the user
  const userId = uuid.v4();

  // Add the new client to the set of connected clients
  clients.add(ws);

  // Send a welcome message to the new user
  ws.send(`Welcome! Your ID is: ${userId}`);

  // Notify all clients that a new user has joined
  broadcast(`User ${userId} has joined.`);

  // Event listener for incoming messages
  ws.on('message', (message) => {
    console.log(`Received message from ${userId}:`, message);

    // Example: broadcast the received message to all clients
    broadcast(`User ${userId} says: ${message}`);
  });

  // Event listener for connection close
  ws.on('close', () => {
    console.log(`Client ${userId} disconnected.`);

    // Clean up WebRTC peer connections
    const peer = peers.get(userId);
    if (peer) {
      peer.destroy();
      peers.delete(userId);
    }

    clients.delete(ws);
    broadcast(`User ${userId} has left.`);
  });

  // WebRTC handshake
  const peer = new SimplePeer({ initiator: true });

  // Store the WebRTC peer connection
  peers.set(userId, peer);

  // Event listener for signal data
  peer.on('signal', (data) => {
    ws.send(JSON.stringify(data));
  });

  // Event listener for WebRTC data
  peer.on('data', (data) => {
    const message = data.toString();
    console.log(`Received WebRTC message from ${userId}:`, message);

    // Example: broadcast the received WebRTC message to all clients
    broadcast(`User ${userId} says via WebRTC: ${message}`);
  });

  // Event listener for WebRTC connection close
  peer.on('close', () => {
    console.log(`WebRTC connection with ${userId} closed.`);
    peers.delete(userId);
  });

  // Event listener for incoming WebRTC signal
  ws.on('message', (message) => {
    const signal = JSON.parse(message);

    if (signal.candidate) {
      peer.addIceCandidate(signal.candidate);
    }

    if (signal.sdp) {
      peer.signal(signal);
    }
  });
});

console.log('WebSocket server is running on port 3000.');
