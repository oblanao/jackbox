const gameList = {}

function Game(gameRoom) {
  this.roomCode = gameRoom.roomCode;
  this.players = {};
  this.initPlayerSockets = () => {
    for (let i=0; i<gameRoom.allPlayerNames.length; i++) {
      let playerName = gameRoom.allPlayerNames[i];
      this.players[playerName] = gameRoom.getSocket(playerName);
    }
  }
  this.removeFromList = () => {
    delete gameList[this.roomCode];
  }
  this.initPlayerSockets();
  gameList[this.roomCode] = this;
  console.log(gameList);
  this.round = () => {
    let maxNumber = 0;
    let winner = '';
    for (var player in this.players) {
      if (this.players.hasOwnProperty(player)) {
        let randomNumber = Math.random()*100+1;
        if (randomNumber>maxNumber) {
          maxNumber = randomNumber;
          winner = player;
        }
        gameRoom.emitToClient(player, 'newRandom', randomNumber);
      }
    }
    setTimeout(() => {
      gameRoom.emitToClient(winner, 'winner');
      gameRoom.emitToServer('winner', winner);
    },1500)
  }
}

module.exports = {
  Game,
  gameList
}