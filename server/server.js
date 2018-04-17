const express = require('express');
const http = require('http');
const path = require('path');
const socketIO = require('socket.io');

const { newRoom, roomExists } = require('./helpers');
const { serverSockets } = require('./serverSockets');

const port = process.env.PORT || 3000;
const publicPath = path.join(__dirname, '/../public');

const app = express();

// all environments
app.use(express.static(publicPath));

var server = http.createServer(app);
var io = socketIO.listen(server);

io.on('connection', (socket) => {
  console.log('New user connected');
  socket.on('newGame-pressed', () => {    
    let roomCode = newRoom();
    serverSockets[roomCode] = socket;
    socket.emit('newRoomCode', (roomCode));
  });
  socket.on('joinGame-pressed', (data) => {
    console.log('joingame pressed!');
    let roomCode = data.roomCode;
    if (!serverSockets[roomCode]) {
      socket.emit('wrongRoomCode', roomCode);
    } else {
      console.log(`User has joined ${roomCode}`);
    }
  })
});

server.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
