// Import App object
$.getScript("app.js", function() {
  console.log(`Script app.js successfuly imported!`);
});

$(document).ready(() => {
  var socket = io();
  // Auto focus input on showing modal
  $('#joinGame-modal').on('shown.bs.modal', function () {
    $('#roomCode').trigger('focus');
  });
  // Event binding for the 2 buttons
  $('#newGame-button').on('click', () => {
    socket.emit('newGame-pressed');
    App.myRole = 'Server';
  });
  $('#joinGame-button').on('click', () => {
    socket.emit('joinGame-pressed', {
      roomCode: $('#roomCode').val().toUpperCase(),
      playerName: $('#playerName').val()
    });
  });
  $(window).on('unload', () => {
    socket.emit('userExit', App.roomCode);
  })
  // Auto submit on enter press for join game form
  $('.modal-dialog input').keypress(function(e){
    if(e.keyCode==13) {
      $('#joinGame-button').click();
    }
  });
  // Logic when user presses new game button
  socket.on('newRoomCode', (roomCode) => {
    // Set App's room
    App.roomCode = roomCode;
    // Update screen
    var screen = $('#newGame-pressed-template').html();
    $('.main-container').html(screen);
    $('.text').text(`JOIN ${roomCode} to start playing`);
  });
  // Logic when user tries to join invalid room
  socket.on('wrongRoomCode', (roomCode) => {
    alert('Roomcode does not exist!');
    $('#roomCode').trigger('focus');
  });
  socket.on('userJoined', (data) => {
    App[App.myRole].userJoined(data.playerName);
    App.roomCode = data.roomCode;
  });
  socket.on('roomDeleted', () => {
    alert('Server disconnected!');
    location.reload(true);
  });
  socket.on('playerLeft', (playerName) => {
    console.log(`${playerName} has left the game!`);
  })
});