var app = {
  myRole: '' // Server or Player
}

const init = (socket) => {
  var screen = $('#default-template').html();
  $('.main-container').html(screen);
}

const joinRoom = (socket) => {
  socket.emit('joinGame-pressed', {
    roomCode: $('#roomCode').val(),
    playerName: $('#playerName').val()
  });
}

$(document).ready(() => {
  var socket = io();
  $('#newGame-button').on('click', () => {
    socket.emit('newGame-pressed');
  });
  $('#joinGame-button').on('click', () => {
    joinRoom(socket);
  })
  $('.modal-dialog input').keypress(function(e){
    if(e.keyCode==13) {
      $('#joinGame-button').click();
    }
  });
  socket.on('newRoomCode', (roomCode) => {
    app.myRole = 'Server';
    var screen = $('#newGame-pressed-template').html();
    $('.main-container').html(screen);
    $('.text').text(`JOIN ${roomCode} to start playing`);
  });
  socket.on('wrongRoomCode', (roomCode) => {
    alert('Roomcode does not exist!');
  })
  socket.on('userJoinedRoom', (room) => {
    console.log(`User has joined ${room}`);
  });
});