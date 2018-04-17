var { roomList } = require('./rooms');

const roomExists = (room) => {
  return roomList.includes(room);
}

const newRoom = () => {
  let alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  do {
    var roomCode = '';
    for (let i = 0; i < 4; i++) {
      roomCode += alphabet[Math.floor(Math.random()*alphabet.length)];
    }
  } while (roomExists(roomCode))
  roomList.push(roomCode);
  return roomCode;
}

module.exports = {
  newRoom,
  roomExists
}
