const templateRules = {
  '#server-pregame-template': (roomCode) => {
    $('.text').text(`JOIN ${roomCode} to start playing`); 
  },
  '#client-pregame-template': (playerName) => {
    $('.greeting').text(`Hello, ${playerName} !`);
  },
  '#room-deleted': (roomCode) => {
    $('#room-roomcode').text(roomCode);
  }
}