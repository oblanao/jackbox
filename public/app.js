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
    chooseAvatar: (avatarList) => {
      for (let i = 0; i < avatarList.length; i++) {
        $('.container-avatar-choices').append(`<img class="img-fluid" src="${avatarList[i]}" alt="avatar_choice" />`)
      }
    }
  },
  Server: {
    userJoined: (playerName) => {
      $('.connected-players').append(`<div id="${playerName}" class="player-avatar"><img class="img-fluid" src="https://i2.wp.com/www.ahfirstaid.org/wp-content/uploads/2014/07/avatar-placeholder.png" alt="player avatar" /><p>${playerName}</div>`);
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
    }
  }
}