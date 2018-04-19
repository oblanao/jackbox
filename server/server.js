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
  // Logic when user exits
  socket.on('userExit', (roomCode) => {
    console.log(roomCode);
    var room = roomList[roomCode];
    if (room.isServer(socket)) {
      room.removeFromList();
      room.emitToAllCients('roomDeleted');
    } else {
      room.emitToServer('playerLeft', socket.playerName);
    }
  });
  // Logic when server has to create new game
  socket.on('newGame-pressed', () => {    
    let roomCode = newRoomCode();
    roomList[roomCode] = new Room(roomCode, socket);

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
      socket.playerName = playerName;
      // Add client to Room    
      room.addClient(socket, playerName);
      // Emit to everyone that user Joined
      room.emitToAll('userJoined', data);
    }
  })
});

server.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
