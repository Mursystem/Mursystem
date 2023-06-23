const WebSocket = require('ws');
// Create a WebSocket server
const wss = new WebSocket.Server({ port: 3000 });
console.log('WebSocket server is running on port 3000.');
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

    peerA.on('message', (message) => {
      let parsedMessage = JSON.parse(message);
       
      if (parsedMessage.type === 'offer' && peerB) {
        peerB.send(JSON.stringify({ type: 'offer', offer: parsedMessage.offer }));
      }
      if (parsedMessage.type === 'offer' && !peerB) {
        savedOffer = parsedMessage.offer; 
      }
      
    });
    peerA.on('close', () => {
      peerA = null;
    });

    ws.send(JSON.stringify({ type: 'role', role: 'peerA' }));
    ws.send(JSON.stringify({ type: 'welcome', message: 'Welcome!' }));
  } else if (!peerB) {
    peerB = ws;

    peerB.on('message', (message) => {
      let parsedMessage = JSON.parse(message);
      if (parsedMessage.type === 'answer' && peerA) {
        peerA.send(JSON.stringify({ type: 'answer', answer: parsedMessage.answer }));
      }
    });

  
    peerB.on('close', () => {
      peerB = null;
    });

    ws.send(JSON.stringify({ type: 'role', role: 'peerB' }));
    ws.send(JSON.stringify({ type: 'welcome', message: 'Welcome!' }));
    if (savedOffer){
      peerB.send(JSON.stringify({ type: 'offer', offer: savedOffer }));
    }
  }
  // Send a welcome message to the new user
  ws.send(JSON.stringify({ type: 'welcome', message: 'Welcome!' }));
});


