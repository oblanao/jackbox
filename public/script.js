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
  // Event binding for the buttons
  $('#newGame-button').on('click', () => {
    socket.emit('newGame-pressed');
  });
  $('#joinGame-button').on('click', () => {
    socket.emit('joinGame-pressed', {
      roomCode: $('#roomCode').val().toUpperCase(),
      playerName: $('#playerName').val()
    });
  });
  $(document).on('click','#startGame-button', () => {
    Game.start(socket);
  })
  // Disconnect event
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
    // Set App's room and role
    App.roomCode = roomCode;
    App.myRole = 'Server';
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
  socket.on('wrongPlayerName', () => {
    alert('playerName invalid!');
    $('#playerName').trigger('focus');
  });
  socket.on('duplicatePlayerName', (playerName) => {
    alert(`Player ${playerName} already exists!`);
    $('#playerName').trigger('focus');
  })
  socket.on('userJoined', (data) => {
    App[App.myRole].userJoined(data.playerName);
    App.roomCode = data.roomCode;
  });
  socket.on('chooseAvatars', (data) => {
    console.log(data);
    App[App.myRole].chooseAvatar(data.avatarList, data.usedAvatars);
  })
  socket.on('roomDeleted', () => {
    alert('Server disconnected!');
    location.reload(true);
  });
  socket.on('playerLeft', (playerName) => {
    App[App.myRole].userLeft(playerName);
  });
  socket.on('userChoseAvatar', (data) => {
    App[App.myRole].userChoseAvatar(data.playerName, data.imageUrl);
  });
  socket.on('serverStartedGame', () => {
    $('.container-avatar-choices').hide();
    $('.main-container').append('<p>game starting!</p>');
  });
  socket.on('newRandom', (randomNumber) => {
    $('.main-container').append(`<p>Your random number is ${randomNumber}</p>`);
  });
  socket.on('winner', (winner) => {
    App[App.myRole].someoneWon(winner);
  });
  // Choosing avatar by clicking on image
  $(document).on('click', '.container-avatar-choices>.img-fluid', function() {
    if (!$(this).hasClass('usedAvatar')) {
      let roomCode = App.roomCode;
      console.log('img clicked!');
      let imageUrl = $(this).attr('src');
      console.log(imageUrl);
      socket.emit('addUsedAvatar', {imageUrl, roomCode});
      socket.emit('chosenAvatar', {imageUrl, roomCode: App.roomCode});
      $('.container-avatar-choices').hide();
    }
  });
});