// Initialize socket
var socket = io();

var App = {
  roomCode: '',
  myRole: 'Client',
  myName: '',
  // Internal helper
  updateScreen: (template, arg) => {
    var screen = $(template).html();
    $('.main-container').html(screen);
    templateRules[template](arg);
  },
  // Client will recieve when playerName and roomCode are valid
  showAvatarChoices: (avatarList, usedAvatars) => {
    for (let i = 0; i < avatarList.length; i++) {
      let imgClass = "img-fluid";
      if (usedAvatars.includes(avatarList[i])) {
        imgClass += ' usedAvatar';
      }
      let img = $('.container-avatar-choices').append(`<img class="${imgClass}" src="${avatarList[i]}" alt="avatar_choice" />`);
    }
  },
  // Client will recieve when roomCode already exists
  wrongRoomCode: (roomCode) => {
    alert('Roomcode does not exist!');
    $('#roomCode').trigger('focus');
  },
  // Client will recieve when playerName already exists
  duplicatePlayerName: (playerName) => {
    alert(`Player with username ${playerName} already joined the game!`);
    $('#playerName').trigger('focus');
  },
  // Client will recieve when roomCode and playerName are valid
  joinCorrect: (data) => {
    // data = {
    //  playerName: 'box',
    //  roomCode: 'ABCD',
    //  avatarList: [],
    //  usedAvatars: []
    // }
    App.myName = data.playerName;
    App.roomCode = data.roomCode;
    $('#joinGame-modal').modal('hide');
    App.updateScreen('#client-pregame-template', App.myName);
    App.showAvatarChoices(data.avatarList, data.usedAvatars);
  },
  // Server will recieve when player correctly joined the game
  userJoined: (playerName) => {
    $('.connected-players').append(`<div id="player-${playerName}" class="player-avatar"><img class="img-fluid" src="https://image.flaticon.com/icons/png/128/168/168876.png" alt="player avatar" /><p>${playerName}</div>`);
  },
  // Server will recieve when player exits in pre-game
  userLeft: (playerName) => {
    let selector = $(`#player-${playerName}`);
    selector.remove();
  },
  // Server will receive when user chose avatar (via NodeJS)
  userChoseAvatar: (data) => {
    // data = {
    //  playerName: 'box',
    //  imageUrl: '...'
    // }
    let selector = $(`#player-${data.playerName} img`);
    selector.attr("src", data.imageUrl);
  },
  // All clients will recieve when one player chose an avatar. This is to fix bug when multiple users are
  // shown the avatar choice screen
  updateUsedAvatars: (imageUrl) => {
    let selector = $('.container-avatar-choices').find(`img[src$="${imageUrl}"]`);
    selector.toggleClass('usedAvatar');
  },
  // Client will recieve when server window closed
  roomDeleted: () => {
    App.updateScreen('#room-deleted', App.roomCode);
  },
  // Server will receive when clicking 'New Game'
  startPregame: (roomCode) => {
    // Set App's room and role
    App.roomCode = roomCode;
    App.myRole = 'Server';
    // Update screen
    App.updateScreen('#server-pregame-template', App.roomCode);
  },
}

// Event binding
socket.on('startPregame', App.startPregame);
socket.on('wrongRoomCode', App.wrongRoomCode);
socket.on('duplicatePlayerName', App.duplicatePlayerName);
socket.on('joinCorrect', App.joinCorrect);
socket.on('userJoined', App.userJoined);
socket.on('makeAvatarChoice', App.makeAvatarChoice);
socket.on('userChoseAvatar', App.userChoseAvatar);
socket.on('userLeft', App.userLeft);
socket.on('roomDeleted', App.roomDeleted);
socket.on('updateUsedAvatars', App.updateUsedAvatars);

// ************************** 
// *  FrontEnd interaction  *
// **************************

// When user exists browser window
$(window).on('unload', () => {
  // Emit event only if user is connected to a game
  if (App.roomCode) {
    socket.emit('windowUnload', App.roomCode);
  }
});
// When user clicks "new game" button
$(document).on('click', '#newGame-button', () => {
  // Emit event to NodeJS to create new game
  socket.emit('createGame');
});
// When user clicks "join game" button, inside modal
$(document).on('click', '#joinGame-button', () => {
  const roomCode = $('#roomCode').val().toUpperCase();
  const playerName = $('#playerName').val();
  // Check if playername is empty
  if (!playerName) {
    alert('Name cannot be empty!');
    $('#playerName').trigger('focus');
  } else {
    // Emit event to NodeJS to check playerName and roomcode
    socket.emit('userTriesToJoin', {
      roomCode,
      playerName
    });
    // Note that if roomcode is empty we don't care on client-side as it will return error as nonexisting from Node
  }
});

// When users clicks on avatar that is not used
$(document).on('click', '.container-avatar-choices>.img-fluid', function() {
  if (!$(this).hasClass('usedAvatar')) {
    let imageUrl = $(this).attr('src');
    socket.emit('userChoseAvatar', {imageUrl, roomCode: App.roomCode});
    $('.container-avatar-choices').hide();
  }
});

// When modal shows up
$('#joinGame-modal').on('shown.bs.modal', function () {
  $('#roomCode').trigger('focus');
});

// Auto submit on enter press for join game form
$('.modal-dialog input').keypress(function(e){
  if(e.keyCode==13) {
    $('#joinGame-button').click();
  }
});

// When "Start game" is clicked on server
$(document).on('click', '#startGame-button', () => {
  // This will also emit the 'start-game' event after countdown finishes
  App.updateScreen('#server-game_starting-template', socket);
});
