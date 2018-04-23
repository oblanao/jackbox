var App = {
  roomCode: '',
  myRole: 'Client', // changes to 'Server' when New Game button is pressed
  Client: {
    userJoined: (playerName) => {
      $('#joinGame-modal').modal('hide');
      $('.main-container').empty();
      var screen= $('#waiting-for-users').html();
      $('.main-container').html(screen);
      $('.greeting').text(`Hello, ${playerName} !`);
    },
    chooseAvatar: (avatarList, usedAvatars) => {
      console.log(usedAvatars);
      for (let i = 0; i < avatarList.length; i++) {
        if (usedAvatars.includes(avatarList[i])) {
          $('.container-avatar-choices').append(`<img class="img-fluid usedAvatar" src="${avatarList[i]}" alt="avatar_choice" />`)
        } else {
          $('.container-avatar-choices').append(`<img class="img-fluid" src="${avatarList[i]}" alt="avatar_choice" />`)
        }
      }
    },
    someoneWon: () => {
      alert('You Won!');
    }
  },
  Server: {
    userJoined: (playerName) => {
      $('.connected-players').append(`<div id="${playerName}" class="player-avatar"><img class="img-fluid" src="https://image.flaticon.com/icons/png/128/168/168876.png" alt="player avatar" /><p>${playerName}</div>`);
    },
    userLeft: (playerName) => {
      let selector = $(`#${playerName}`);
      selector.remove();
    },
    userChoseAvatar: (playerName, imageUrl) => {
      console.log(imageUrl);
      let selector = $(`#${playerName} img`);
      console.log(selector);
      selector.attr("src", imageUrl);
    },
    someoneWon: (winner) => {
      $('.main-container').append(`<h1>${winner} has won the game!`);
    }
  }
}

var Game = {
  start: (socket) => {
    socket.emit('gameStarted', App.roomCode);
  }
}