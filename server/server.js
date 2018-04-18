const express = require('express');
const http = require('http');
const path = require('path');
const socketIO = require('socket.io');

const { newRoomCode, roomExists, roomList, roomNamesList, Room } = require('./rooms');

const port = process.env.PORT || 3000;
const publicPath = path.join(__dirname, '/../public');

const app = express();

// all environments
app.use(express.static(publicPath));

var server = http.createServer(app);
var io = socketIO.listen(server);

io.on('connection', (socket) => {
  // Logic when server has to create new game
  socket.on('newGame-pressed', () => {    
    let roomCode = newRoomCode();
    roomList[roomCode] = new Room(roomCode, socket);
    console.log(roomList[roomCode]);
    // Emit to server of room
    roomList[roomCode].emitToServer('newRoomCode', roomCode);
  });
  // Logic when server checks user trying to join room
  socket.on('joinGame-pressed', (data) => {
    const roomCode = data.roomCode;
    if (!roomExists(roomCode)) {
      socket.emit('wrongRoomCode', roomCode);
    } else {
      var room = roomList[roomCode];
      const playerName = data.playerName;
      // Add client to Room    
      room.addClient(socket, playerName);
      // Emit to server
      room.emitToServer('userJoined-server', playerName);
      // Emit to all clients
      room.emitToAllClients('userJoined-clients', playerName);
      // Emit to box that room is full
      if (room.clientsSockets.length === 3) {
        room.emitToClient('box', 'testEvent', 'ma sugi');
      }
    }
  })
});

server.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
