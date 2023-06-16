const express = require('express');
const cors = require('cors');
const path = require('path');
const expressWs = require('express-ws');

const app = express();
const port = process.env.PORT || 3000; // Use the environment variable 'PORT' if available, otherwise default to 3000

// Enable WebSocket support
const wsInstance = expressWs(app);

app.use(cors());

// Serve the static files from the 'public' directory
app.use(express.static('public'));

// Serve the 'index.html' file from the root URL
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// WebSocket endpoint
app.ws('/websocket', (ws, req) => {
  // WebSocket connection established
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

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
