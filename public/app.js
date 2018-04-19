var App = {
  myRole: 'Client', // changes to 'Server' when New Game button is pressed
  Client: {
    userJoined: (playerName) => {
      $('#joinGame-modal').modal('hide');
      $('.main-container').empty();
      var screen= $('#waiting-for-users').html();
      $('.main-container').html(screen);
      $('.greeting').text(`Hello, ${playerName} !`);
    }
  },
  Server: {
    userJoined: (playerName) => {
      $('li').append(`<ul class="player" id="${playerName}">${playerName}</ul>`);
    }
  }
}
