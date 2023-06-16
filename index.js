const http = require('http');
const WebSocket = require('ws');
const path = require('path');
const fs = require('fs');

const port = 3000;

// Create HTTP server
const server = http.createServer((req, res) => {
  // Serve the 'index.html' file from the root URL
  if (req.url === '/') {
    const indexPath = path.join(__dirname, 'index.html');
    fs.readFile(indexPath, 'utf8', (err, data) => {
      if (err) {
        res.statusCode = 500;
        res.end('Internal Server Error');
      } else {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/html');
        res.end(data);
      }
    });
  } else {
    res.statusCode = 404;
    res.end('Not Found');
  }
});

// Create WebSocket server
const wss = new WebSocket.Server({ server });

// WebSocket connection established
wss.on('connection', (ws) => {
  console.log('WebSocket connection established');

  // Handle incoming messages
  ws.on('message', (message) => {
    console.log('Received message:', message);
    // Process and handle the received message

    // Example: Echo the message back to the client
    ws.send(message);
  });

  // Handle WebSocket connection closure
  ws.on('close', () => {
    console.log('WebSocket connection closed');
    // Handle connection closure
  });
});

server.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
