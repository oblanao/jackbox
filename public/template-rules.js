const makeContainerFullScreen = () => {
  let container = $('.main-container');
  container.css({
    "height": "100vh",
    "width": "100vw",
    "display": "flex",
    "flex-direction": "column",
  });
}

const addPlayersToHeader = (data, callback) => {
  let header = $('.in-game-header');
    let delay = 0;
    let playersLength = 0;
    for (let player in data) {
      if (data.hasOwnProperty(player)) {
        delay += 1000;
        setTimeout(() => {
          playersLength++;
          header.append(`<div class='header-player cssanimation lightning zoomIn' id='header-player-${player}'><img class='img-fluid header-player-avatar' src='${data[player].avatar}' /><p class='header-player-name'>${player}</p></div>`);
          var sound = new Audio('/sounds/enter.wav');
          sound.play();
          if ((delay/1000) === playersLength) {
            callback();
          }
        }, delay);
      }
    }
}
const talk = () => {
  wait(1000).then(() => {
    console.log('ma sugi!')
  });
}

const wait = (ms) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, ms)
  })
}

const templateRules = {
  '#server-pregame-template': (roomCode) => {
    $('.text').text(`JOIN ${roomCode} to start playing`); 
  },
  '#client-pregame-template': (playerName) => {
    $('.greeting').text(`Hello, ${playerName} !`);
  },
  '#room-deleted': (roomCode) => {
    $('#room-roomcode').text(roomCode);
  },
  '#server-game_starting-template': (socket) => {
    // Adjust main-container. This is neccesary because if width and height is set for countdown, it is not centered
    $('.main-container').css({
      "width": "60vw",
      // Height is not neccesary
    });
    // Countdown options
    $(".startGame-countdown").TimeCircles({
      "count_past_zero": false,
      "fg_width": 0.05,
      "bg_width": 0.01,
      "time": {
        "Days": { "show": false },
        "Hours": { "show": false },
        "Minutes": { "show": false },
        "Seconds": { "show": true, "text": ""}
      }
    });
    // Countdown events for sounds
    let countdown = $(".startGame-countdown").TimeCircles();
    countdown.addListener(function(unit, value, total) {
    countdown.start();
      if (total === 5) {
        var audio = new Audio('/sounds/5.ogg');
        audio.play();
      } else if (total === 4) {
        var audio = new Audio('/sounds/4.ogg');
        audio.play();
      } else if (total === 3) {
        var audio = new Audio('/sounds/3.ogg');
        audio.play();
      } else if (total === 2) {
        var audio = new Audio('/sounds/2.ogg');
        audio.play();
      } else if (total === 1) {
        var audio = new Audio('/sounds/1.ogg');
        audio.play();
        // Debug: countdown.stop();
      } else if (total <= 0) {
        setTimeout(() => {
          var audio = new Audio('/sounds/begin.ogg');
          audio.play();
          countdown.end().fadeOut();
          // Emit start-game event
          socket.emit('game-start', App.roomCode);
        },750);
      }
    });
  },
  '#server-in-game-template': async (data) => {
    makeContainerFullScreen();
    // Add every player with avatar and name to screen header
    await addPlayersToHeader(data, talk);
  } 
}