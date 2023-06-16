const WebSocket = require('ws');
const uuid = require('uuid');

// Create a WebSocket server
const wss = new WebSocket.Server({ port: 3000 });

// Store connected clients
const clients = new Set();

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
    
    clients.delete(ws);
    broadcast(`User ${userId} has left.`);
  });
});

console.log('WebSocket server is running on port 3000.');
