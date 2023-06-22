const WebSocket = require('ws');
// Create a WebSocket server
const wss = new WebSocket.Server({ port: 3000 });
// Store connected clients
const clients = new Set();
let peerA = null;
let peerB = null;
let savedOffer = null;
// Broadcast a message to all connected clients
function broadcast(message) {
  clients.forEach((client) => {
    client.send(JSON.stringify(message));
  });
}
// Event listener for new connections
wss.on('connection', (ws) => {
  console.log('A new client has connected.');
  // Check if both peers are already connected
  if (peerA && peerB) {
    ws.send(JSON.stringify({ type: 'reject', message: 'Maximum connections reached.' }));
    ws.close();
    return;
  }
  // Set the role for the current peer
  if (!peerA) {
    peerA = ws;
    ws.send(JSON.stringify({ type: 'role', role: 'peerA' }));
    ws.send(JSON.stringify({ type: 'welcome', message: 'Welcome!'  }));
  } else if (!peerB) {
    peerB = ws;
    ws.send(JSON.stringify({ type: 'role', role: 'peerB' }));
    ws.send(JSON.stringify({ type: 'welcome', message: 'Welcome!'  }));
  }
  // Send a welcome message to the new user
  ws.send(JSON.stringify({ type: 'welcome', message: 'Welcome!'  }));

  // Event listener for incoming messages
  peerA.on('message', (message) => {
    const parsedMessage = JSON.parse(message);
    if (parsedMessage.type === 'offer') {
      savedOffer = parsedMessage.offer;
    }
    if (parsedMessage.type === 'answer') {
      peerB.send({ type: 'answer', answer: parsedMessage.answer });
    }
  });

  peerB.on('message', (message) => {
    const parsedMessage = JSON.parse(message);
    
    if (parsedMessage.type === 'ready') {
      peerB.send({ type: 'offer', offer: savedOffer });
    }
  });
  
  // Event listener for connection close
  peerA.on('close', () => {
    peerB.send({ type: 'leave', message: "peer A left" });
    peerA = null;
  })
  peerB.on('close', () => {
    peerA.send({ type: 'leave', message: "peer B left" });
    peerA = null;
  })


});
console.log('WebSocket server is running on port 3000.');
