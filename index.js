const WebSocket = require('ws');

// Create a WebSocket server
const wss = new WebSocket.Server({ port: 3000 });

// Event listener for new connections
wss.on('connection', (ws) => {
  console.log('A new client has connected.');

  // Event listener for incoming messages
  ws.on('message', (message) => {
    console.log('Received message:', message.toString());
  });

  // Event listener for connection close
  ws.on('close', () => {
    console.log('Client disconnected.');
  });
});

console.log('WebSocket server is running on port 3000.');
