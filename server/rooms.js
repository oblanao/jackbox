const roomNamesList = [];
const roomList = {};

const roomExists = (room) => {
  return roomNamesList.includes(room);
}

const newRoomCode = () => {
  let alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  do {
    var roomCode = '';
    for (let i = 0; i < 4; i++) {
      roomCode += alphabet[Math.floor(Math.random()*alphabet.length)];
    }
  } while (roomExists(roomCode))
  roomNamesList.push(roomCode);
  return roomCode;
}

function Room(roomCode, socket) {
  this.roomCode = roomCode;
  this.serverSocket = socket;
  this.clientsSockets = [];
  this.clientSocketIndex = {}
  this.getSocket = (playerName) => this.clientsSockets[this.clientSocketIndex[playerName]];
  this.addClient = (socket, clientName) => {
    this.clientsSockets.push(socket);
    this.clientSocketIndex[clientName] = this.clientsSockets.length-1;
  }
  this.emitToServer = (event, data) => {
    this.serverSocket.emit(event, data);
  }
  this.emitToAllClients = (event, data) => {
    for (i=0;i<this.clientsSockets.length;i++) {
      this.clientsSockets[i].emit(event, data);
    }
  }
  this.emitToClient = (clientName, event, data) => {
    // let clientIndex = this.clientSocketIndex[clientName];
    // this.clientsSockets[clientIndex].emit(event, data);
    this.getSocket(clientName).emit(event, data);
  }
}

module.exports = {
  roomNamesList,
  roomList,
  roomExists,
  newRoomCode,
  Room
}