// Import the WebSocket library
const WebSocket = require('ws');

// Create a WebSocket server
const wss = new WebSocket.Server({ port: 3000 });

// Store connected clients
const clients = {};

// Handle incoming connections
wss.on('connection', (ws) => {
  // Assign a unique identifier to the client
  const id = Math.random().toString(36).substring(2);
  clients[id] = ws;
  ws.send(JSON.stringify({ type: 'id', data: id }));

  // Handle incoming messages
  ws.on('message', (message) => {
    const data = JSON.parse(message);
    switch (data.type) {
      case 'offer':
        // Broadcast the offer to all other clients
        Object.keys(clients).forEach((clientId) => {
          if (clientId !== id) {
            clients[clientId].send(message);
          }
        });
        break;
      case 'answer':
        // Send the answer back to the original client
        clients[data.to].send(message);
        break;
      case 'candidate':
        // Broadcast the ICE candidate to all other clients
        Object.keys(clients).forEach((clientId) => {
          if (clientId !== id) {
            clients[clientId].send(message);
          }
        });
        break;
      default:
        break;
    }
  });

  // Handle disconnections
  ws.on('close', () => {
    delete clients[id];
  });
});