const http = require('http');
const httpProxy = require('http-proxy');
const WebSocket = require('ws');

// Create an HTTP server
const server = http.createServer();

// Create a WebSocket server
const wss = new WebSocket.Server({ noServer: true });

// Event listener for new connections
wss.on('connection', (ws) => {
  console.log('A new client has connected.');

  // Event listener for incoming messages
  ws.on('message', (message) => {
    console.log('Received message:', message);
  });

  // Event listener for connection close
  ws.on('close', () => {
    console.log('Client disconnected.');
  });
});

// Proxy WebSocket upgrade requests
server.on('upgrade', (req, socket, head) => {
  wss.handleUpgrade(req, socket, head, (ws) => {
    wss.emit('connection', ws, req);
  });
});

// Start the HTTP server
server.listen(8080, () => {
  console.log('Reverse proxy server is running on port 8080.');
});
