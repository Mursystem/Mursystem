const WebSocket = require('ws');
// Create a WebSocket server
const webSocketServer = new WebSocket.Server({ port: 3000 });
console.log('WebSocket server is running on port 3000.');

let peerA = null;
let peerB = null;
let savedOffer = null;
let websocketArray = [];


// Check if the peer in the same room has already connected
function isPeerConnected(roomName, role) {
  var peer = websocketArray.find(item => item.id === roomName && item.role === role);
  return !!peer;
}

webSocketServer.on('connection', (newSocket) => {
  console.log('A new user has connected to the WebSocket.');

  newSocket.on('message', (message) => {
    let parsedMessage = JSON.parse(message);

    if (parsedMessage.type === 'room') {
      console.log(parsedMessage.room);
      console.log(parsedMessage.role);

      // Check if the peer has already connected
      if (isPeerConnected(parsedMessage.room, parsedMessage.role)) {
        newSocket.send(JSON.stringify({ type: 'reject', message: 'Peer already connected.' }));
        newSocket.close();
        return;
      }
      // Add the WebSocket instance to the websocketArray
      websocketArray.push({ id: parsedMessage.room, socket: newSocket, role: parsedMessage.role });
      newSocket.send(JSON.stringify({ type: 'welcome', message: 'Peer already connected.' }));
    }

    if (parsedMessage.type === 'ready') {
      console.log(parsedMessage.role, "is Ready!");
    }
  });
});


function sendMessageToWebSocket(roomName, message) {
  var socket = websocketArray.find(item => item.id === roomName)?.socket;
  if (socket) {
    socket.send(message);
  }
}


/*  
  // Set the role for the current peer

 
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
      if (parsedMessage.type === 'request') {
        peerA.send(JSON.stringify({ type: 'request'}));
      }
 
    }); 
 
 
      peerB.on('close', () => {
      peerB = null;
    });
 
    ws.send(JSON.stringify({ type: 'role', role: 'peerB' }));
    ws.send(JSON.stringify({ type: 'welcome', message: 'Welcome!' }));
    
    if (savedOffer) {
      peerB.send(JSON.stringify({ type: 'offer', offer: savedOffer }));
    }
  }
  // Send a welcome message to the new user
  ws.send(JSON.stringify({ type: 'welcome', message: 'A user has joined the room!' })); */




