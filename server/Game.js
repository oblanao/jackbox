const { getAvatarList } = require('./helpers');

// Object with all current games
const allGames = {}

// Helper functions
const roomcodeExists = (roomCode) => {
  return allGames.hasOwnProperty(roomCode);
}

const newRoomcode = () => {
  let alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  do {
    var roomCode = '';
    for (let i = 0; i < 4; i++) {
      roomCode += alphabet[Math.floor(Math.random()*alphabet.length)];
    }
  } while (roomcodeExists(roomCode))
  return roomCode;
}

// Game constructor
function Game(roomCode, socket) {
  this.roomCode = roomCode;
  this.serverSocket = socket;
  this.clientSockets = {};  // Will be { 'playerName': {Socket} }
  this.players = {};  // Will be { 'playerName': {name: 'playerName', avatar: 'http://....', score: 80 } }
  this.usedAvatars = [];  // Will be ['src1', 'src2'..]
  this.status = 'pre-game';  // Will be 'pre-game', 'soon-game', 'in-game', 'pre-finish', 'soon-finish', 'finish'
  allGames[roomCode] = this; // create the game in allGames oject
  // Methods
  this.getName = (socket) => {
    for (player in this.clientSockets) {
      if (this.clientSockets[player] === socket) {
        return player;
      }
    }
    return null;
  }
  this.playerExists = (playerName) => {
    return this.players.hasOwnProperty(playerName);
  }
  this.emitToServer = (event, data) => {
    this.serverSocket.emit(event, data);
  }
  this.emitToAllClients = (event, data) => {
    for (player in this.clientSockets) {
      this.clientSockets[player].emit(event, data);
    }
  }
  this.emitToClient = (clientName, event, data) => {
    this.clientSockets[clientName].emit(event, data);
  }
  this.addClient = (socket, clientName) => {
    this.clientSockets[clientName] = socket;
    this.players[clientName] = {
      name: clientName,
      avatar: '',
      score: 0
    }
    // Emit to server that new user joined
    this.emitToServer('userJoined', clientName);
    // Emit to client that joined, to change HTML
    this.emitToClient(clientName, 'joinCorrect', {
      playerName: clientName,
      roomCode: this.roomCode,
      avatarList: getAvatarList(),
      usedAvatars: this.usedAvatars
    });
  }
  this.removeClient = (socket) => {
    let playerName = this.getName(socket);
    let playerAvatar = this.players[playerName].avatar;
    let indexInUsedAvatars = this.usedAvatars.indexOf(this.players[playerName].avatar);
    this.usedAvatars.splice(indexInUsedAvatars,1);
    delete this.clientSockets[playerName];
    delete this.players[playerName];
    this.emitToServer('userLeft', playerName);
    this.emitToAllClients('updateUsedAvatars', playerAvatar);
  }
  this.isServer = (socket) => socket === this.serverSocket
  this.destroy = () => {
    delete allGames[this.roomCode];
    this.emitToAllClients('roomDeleted');
  }
  this.emitToServer('startPregame', this.roomCode); // emit the startPregame event
  // Game Logic here
}

module.exports = {
  allGames,
  Game,
  newRoomcode,
  roomcodeExists
}