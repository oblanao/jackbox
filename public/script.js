// Initialize socket
var socket = io();

// Questions as a dictionary

var questions = [
  {
    title: "Test 1",
    answer: 1
  },
  {
    title: "Test 2",
    answer: 2
  },
  {
    title: "Test 3",
    answer: 3
  },
  {
    title: "Test 4",
    answer: 4
  },
  {
    title: "Test 5",
    answer: 5
  }
];

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
  // Internal helper
  shuffleArray: (array) => {
    array.sort(() => Math.random() - 0.5)
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
  // Server will receive after starting game countdown reaches 0
  transferPlayersData: (data) => {
    App.Game.players = data;
    // console.log(App.Game);
    App.Game.start();
  },
  // Object of game with data and methods
  Game: {
    round: 0,
    players: {},
    playerOrder: [],
    questionOrder: [],
    randomizePlayerOrder: () => {
      // populate playerOrder array
      for (player in App.Game.players) {
        if (App.Game.players.hasOwnProperty(player)) {
          App.Game.playerOrder.push(player);
        }
      }
      // randomize the playerOrder
      App.shuffleArray(App.Game.playerOrder);
    },
    randomizeQuestionOrder: () => {
      App.shuffleArray(questions);
      App.Game.questionOrder = [...questions.slice(0,App.Game.playerOrder.length)];
    },
    randomize: () => {
      App.Game.randomizePlayerOrder();
      App.Game.randomizeQuestionOrder();
    },
    start: () => {
      App.updateScreen('#server-in-game-template', App.Game.players);
      // App.Game.randomize();
      // App.Game.nextRound();
    },
    nextRound: () => {
      App.Game.round += 1;
      let indexRound = App.Game.round - 1 // This is because array start at 0 :)
      let container = $('.in-game-main');
      container.append(`<h4>It's ${App.Game.playerOrder[indexRound]}'s turn!</h4>`);
      container.append(`<h1 class="question-title">${App.Game.questionOrder[indexRound].title}`);
    }
  }
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
socket.on('transferPlayersData', App.transferPlayersData);

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
