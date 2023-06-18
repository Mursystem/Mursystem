const WebSocket = require('ws');
const uuid = require('uuid');

// Create a WebSocket server
const wss = new WebSocket.Server({ port: 3000 });

// Store connected clients
const clients = new Set();
let peerA = null;
let peerB = null;
let offerToPeerB = null;

// Broadcast a message to all connected clients
function broadcast(message) {
  clients.forEach((client) => {
    client.send(JSON.stringify(message));
  });
}

// Send the offer to Peer B
function sendOfferToPeerB() {
  if (offerToPeerB && peerB) {
    const peerBClient = Array.from(clients).find((client) => client.userId === peerB);
    if (peerBClient) {
      peerBClient.send(JSON.stringify({ type: 'offer', offer: offerToPeerB }));
      offerToPeerB = null; // Clear the stored offer
    }
  }
}

// Event listener for new connections
wss.on('connection', (ws) => {
  console.log('A new client has connected.');

  // Generate a random ID for the user
  const userId = uuid.v4();

  // Add the new client to the set of connected clients
  clients.add(ws);
  ws.userId = userId; // Assign the userId property to the WebSocket object

  // Check if both peers are already connected
  if (peerA && peerB) {
    ws.send(JSON.stringify({ type: 'reject', message: 'Maximum connections reached.' }));
    ws.close();
    return;
  }

  // Set the role for the current peer
  if (!peerA) {
    peerA = userId;
    ws.send(JSON.stringify({ type: 'role', role: 'peerA' }));
  } else if (!peerB) {
    peerB = userId;
    ws.send(JSON.stringify({ type: 'role', role: 'peerB' }));
    sendOfferToPeerB();
  }

  // Send a welcome message to the new user
  ws.send(JSON.stringify({ type: 'welcome', message: `Welcome! Your ID is: ${userId}` }));

  // Notify all clients that a new user has joined
  broadcast({ type: 'join', userId });

  // Event listener for incoming messages
  ws.on('message', (message) => {
    const parsedMessage = JSON.parse(message);
    console.log(`Received message from ${userId}:`, parsedMessage);

    if (parsedMessage.type === 'offer' && userId === peerA) {
      offerToPeerB = parsedMessage.offer;
      sendOfferToPeerB();
    }
  });

  // Event listener for connection close
  ws.on('close', () => {
    console.log(`Client ${userId} disconnected.`);

    clients.delete(ws);
    broadcast({ type: 'leave', userId });

    // Reset the role if a peer disconnects
    if (userId === peerA) {
      peerA = null;
    } else if (userId === peerB) {
      peerB = null;
    }
  });
});

console.log('WebSocket server is running on port 3000.');
