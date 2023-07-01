const WebSocket = require('ws');
// Create a WebSocket server
const webSocketServer = new WebSocket.Server({ port: 3000 });
console.log('WebSocket server is running on port 3000.');

let peerA = null;
let peerB = null;
let savedOffer = null;
let websocketArray = [];

webSocketServer.on('connection', (newSocket) => {
  console.log('A new user has connected to the WebSocket.');

  newSocket.on('message', (message) => {
    let parsedMessage = JSON.parse(message);
    onsole.log(parsedMessage);
    if (parsedMessage.type === 'room') {
      // Check if the peer has already connected
      if (isPeerConnected(parsedMessage.room, parsedMessage.role)) {
        newSocket.send(JSON.stringify({ type: 'reject', message: 'Peer already connected.' }));
        newSocket.close();
        return;
      }
      // Add the WebSocket instance to the websocketArray
      websocketArray.push({ id: parsedMessage.room, socket: newSocket, role: parsedMessage.role, ready: false });
      newSocket.send(JSON.stringify({ type: 'welcome', message: 'Welcome to the room!', role: parsedMessage.role }));
    }
    if (parsedMessage.type === 'offerFromHost') {
      msgToSend = JSON.stringify({ type: 'offerFromServer', offer: parsedMessage.offer });
      sendMessageToWebSocket(parsedMessage.room, msgToSend, "client");
    }
    if (parsedMessage.type === 'answerFromClient') {
      msgToSend = JSON.stringify({ type: 'answerFromServer', answer: parsedMessage.answer });
      sendMessageToWebSocket(parsedMessage.room, msgToSend, "host");
    }
    if (parsedMessage.type === 'requestNewOffer') {
      msgToSend = JSON.stringify({ type: 'request' });
      sendMessageToWebSocket(parsedMessage.room, msgToSend, "host");
    }
    if (parsedMessage.type === 'ready') {
      console.log(parsedMessage.role, "is ready!");
      // Find the WebSocket connection object in the array and update its ready property
      var connection = websocketArray.find(item => item.id === parsedMessage.room && item.role === parsedMessage.role);
      if (connection) {
        connection.ready = true;
        if (checkBothReady(parsedMessage.room)) {
          var msgToSend = JSON.stringify({ type: 'start', message: 'Starting, both are ready!' });
          sendMessageToWebSocket(parsedMessage.room, msgToSend, "host");
          sendMessageToWebSocket(parsedMessage.room, msgToSend, "client");
        }
      }
    }
  });
});

function checkBothReady(roomName) {
  // Find the WebSocket connections for the current role and opposite role in the same room
  var clientStatus = websocketArray.filter(item => item.id === roomName && item.role === 'client' && item.ready === true);
  var hostStatus = websocketArray.filter(item => item.id === roomName && item.role === 'host' && item.ready === true);
  let allReady = false;
  if (clientStatus.length > 0 && hostStatus.length > 0) {
    allReady = true;
  }
  return !!allReady
}

function sendMessageToWebSocket(roomName, message, role) {
  var socket = websocketArray.find(item => item.id === roomName && item.role == role)?.socket;
  if (socket) {
    socket.send(message);
  }
}

// Check if the peer in the same room has already connected
function isPeerConnected(roomName, role) {
  var peer = websocketArray.find(item => item.id === roomName && item.role === role);
  //convert peer into booleen true/false
  return !!peer;
}