const WebSocket = require('ws');

// Create a WebSocket server
const wss = new WebSocket.Server({ port: 3000 });
console.log('WebSocket server is running on port 3000.');

const rooms = {};

// Event listener for new connections
wss.on('connection', (ws) => {
  console.log('A new client has connected.');

  ws.on('message', (message) => {
    let parsedMessage = JSON.parse(message);

    if (parsedMessage.type === 'join') {
      joinRoom(ws, parsedMessage.room);
    }

    let room = findRoomByPeer(ws);
    if (!room) {
      ws.send(JSON.stringify({ type: 'reject', message: 'You are not in a room.' }));
      ws.close();
      return;
    }

    let peer = room.peers.find((peer) => peer.ws === ws);

    if (parsedMessage.type === 'offer' && room.peers.length === 2) {
      let targetPeer = room.peers.find((peer) => peer.ws !== ws);
      if (targetPeer) {
        targetPeer.ws.send(JSON.stringify({ type: 'offer', offer: parsedMessage.offer }));
      }
    }
    if (parsedMessage.type === 'offer' && room.peers.length === 1) {
      peer.savedOffer = parsedMessage.offer;
    }
    if (parsedMessage.type === 'answer') {
      let targetPeer = room.peers.find((peer) => peer.ws !== ws);
      if (targetPeer) {
        targetPeer.ws.send(JSON.stringify({ type: 'answer', answer: parsedMessage.answer }));
      }
    }
    if (parsedMessage.type === 'request') {
      let targetPeer = room.peers.find((peer) => peer.ws !== ws);
      if (targetPeer) {
        targetPeer.ws.send(JSON.stringify({ type: 'request' }));
      }
    }
  });

  ws.on('close', () => {
    let room = findRoomByPeer(ws);
    if (room) {
      let peerIndex = room.peers.findIndex((peer) => peer.ws === ws);
      if (peerIndex !== -1) {
        room.peers.splice(peerIndex, 1);
      }
      if (room.peers.length === 0) {
        delete rooms[room.id];
      }
    }
  });

  // Send a welcome message to the new user
  ws.send(JSON.stringify({ type: 'welcome', message: 'A user has joined the server!' }));
});

function joinRoom(ws, room) {
  if (!rooms[room]) {
    rooms[room] = { id: room, peers: [] };
  }

  let currentRoom = findRoomByPeer(ws);
  if (currentRoom) {
    // Already in a room, remove from the current room
    let peerIndex = currentRoom.peers.findIndex((peer) => peer.ws === ws);
    if (peerIndex !== -1) {
      currentRoom.peers.splice(peerIndex, 1);
    }
    if (currentRoom.peers.length === 0) {
      delete rooms[currentRoom.id];
    }
  }

  let targetRoom = rooms[room];
  if (targetRoom.peers.length < 2) {
    targetRoom.peers.push({ ws: ws, savedOffer: null });
    ws.send(JSON.stringify({ type: 'room', room: room, role: getPeerRole(targetRoom.peers.length) }));
    if (targetRoom.peers.length === 2 && targetRoom.peers[1].savedOffer) {
      targetRoom.peers[0].ws.send(JSON.stringify({ type: 'offer', offer: targetRoom.peers[1].savedOffer }));
    }
  } else {
    ws.send(JSON.stringify({ type: 'reject', message: 'The room is already full.' }));
    ws.close();
  }
}

function findRoomByPeer(ws) {
  for (let room of Object.values(rooms)) {
    if (room.peers.some((peer) => peer.ws === ws)) {
      return room;
    }
  }
  return null;
}

function getPeerRole(peerCount) {
  return (peerCount === 1) ? 'peerA' : 'peerB';
}
