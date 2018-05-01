// Import modules
const express = require('express');
const http = require('http');
const path = require('path');
const socketIO = require('socket.io');

// Import internal js components
const { allGames, Game, newRoomcode, roomcodeExists } = require('./Game');

// Server variables
const port = process.env.PORT || 3000;
const publicPath = path.join(__dirname, '/../public');

// Initialize express
const app = express();

// serve static public files
app.use(express.static(publicPath));

// Initialize socket.io
var server = http.createServer(app);
var io = socketIO.listen(server);

// socket.io events
io.on('connection', (socket) => {
  // When one of the windows connected to the game is closed
  socket.on('windowUnload', (roomCode) => {
    var game = allGames[roomCode];
    if (game) {
      if (game.isServer(socket)) { // If server unloaded the window
        game.destroy();
      } else { // If player unloaded the window
        game.removeClient(socket);
      }
    }
  });
  // When 'newGame-button' is clicked
  socket.on('createGame', () => {
    // Generate new, unique roomcode
    let roomCode = newRoomcode();
    // Create new instance of Game. This will also emit the startPregame event
    allGames[roomCode] = new Game(roomCode, socket);
  });
  // When 'joinGame-button' is clicked
  socket.on('userTriesToJoin', (data) => {
    const roomCode = data.roomCode;
    // If the roomcode does not exist
    if (!roomcodeExists(roomCode)) {
      socket.emit('wrongRoomCode', roomCode);
    } else { // If game with roomcode exists
      var game = allGames[roomCode];
      const playerName = data.playerName;
      if (game.playerExists(playerName)) {
        socket.emit('duplicatePlayerName', (playerName));
      } else {
        // Add client to Room. This will also emit correct events to server and self
        game.addClient(socket, playerName);
      }
    }
  });
  // When user clicks on some avatar
  socket.on('userChoseAvatar', (data) => {
    let roomCode = data.roomCode;
    let imageUrl = data.imageUrl;
    var game = allGames[roomCode];
    var playerName = game.getName(socket);
    // 1. Update game.usedAvatars with new src
    game.usedAvatars.push(imageUrl);
    // 2. Change Player[name].avatar to src
    game.players[playerName].avatar = imageUrl;
    // 3. Update avatar choices for every player
    game.emitToAllClients('updateUsedAvatars', imageUrl);
    // 4. Update server to show avatar of player
    game.emitToServer('userChoseAvatar', {
      imageUrl,
      playerName
    });
  });
  socket.on('game-start', (roomCode) => {
    var game = allGames[roomCode];
    socket.emit('transferPlayersData', game.players);
  });
});

// Initialize server
server.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});